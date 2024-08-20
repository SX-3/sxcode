# Composite proxy

I used this pattern when developing [@sx3/database](https://sx-3.github.io/database/).
Most likely, it is also found in other projects in a slightly different form.

## Extending techniques

There are situations when you need to extend an object or native interface
to overwrite a couple of functions, but you can't do it directly, for example:

```ts twoslash
class Databse extends IDBDatabase {}
```

This code will return an `Illegal constructor` error.
What other options are there? Throw all the properties of the object:

::: details Lots of code

```ts
class Databse implements IDBDatabase {
	name: string;
	objectStoreNames: DOMStringList;
	onabort: ((this: IDBDatabase, ev: Event) => any) | null;
	onclose: ((this: IDBDatabase, ev: Event) => any) | null;
	onerror: ((this: IDBDatabase, ev: Event) => any) | null;
	onversionchange:
		| ((this: IDBDatabase, ev: IDBVersionChangeEvent) => any)
		| null;
	version: number;
	close(): void {
		throw new Error("Method not implemented.");
	}
	createObjectStore(
		name: string,
		options?: IDBObjectStoreParameters
	): IDBObjectStore {
		throw new Error("Method not implemented.");
	}
	deleteObjectStore(name: string): void {
		throw new Error("Method not implemented.");
	}
	transaction(
		storeNames: string | string[],
		mode?: IDBTransactionMode,
		options?: IDBTransactionOptions
	): IDBTransaction;
	transaction(
		storeNames: string | Iterable<string>,
		mode?: IDBTransactionMode,
		options?: IDBTransactionOptions
	): IDBTransaction;
	transaction(
		storeNames: unknown,
		mode?: unknown,
		options?: unknown
	): IDBTransaction {
		throw new Error("Method not implemented.");
	}
	addEventListener<K extends keyof IDBDatabaseEventMap>(
		type: K,
		listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(type: unknown, listener: unknown, options?: unknown): void {
		throw new Error("Method not implemented.");
	}
	removeEventListener<K extends keyof IDBDatabaseEventMap>(
		type: K,
		listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: unknown,
		listener: unknown,
		options?: unknown
	): void {
		throw new Error("Method not implemented.");
	}
	dispatchEvent(event: Event): boolean {
		throw new Error("Method not implemented.");
	}
}
```

:::

Obviously, this is a bad option both because of the amount of code and because it requires duplicating logic.
It would be nice to call methods and properties that are in the original class, and pass control to the fallback object if the property or method is not there.
Fortunately, JavaScript has [Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

## Creating a composite proxy

[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy) provides transformation of access to object properties. Accordingly, the concept/pattern of a composite proxy is simple, it has a property in the first object, if there is work with it, if not, we call this property in the second object. So, let's write the code, here is the function for creating a composite proxy:

```ts twoslash
// primary - primary object
// fallback - object for passing unimplemented properties
export function createCompositeProxy<T extends Object, F extends Object>(
	primary: T,
	fallback: F
): T & F {
	// Wrapping an object in Proxy
	return new Proxy(primary, {
		// Get trap allows you to intercept the appeal to the property
		get(target, key, receiver) {
			// Check whether there is a property in Primary if we are returning it
			if (Reflect.has(target, key)) {
				return Reflect.get(target, key, receiver);
			}

			// If not, we return the property from Fallback
			if (Reflect.has(fallback, key)) {
				let value = Reflect.get(fallback, key, fallback);
				// Bind the correct context if this is a method
				if (typeof value === "function") return value.bind(fallback);
				return value;
			}
		},

		// SET trap allows you to intercept the seting of property
		set(target, key, value, receiver) {
			// We check whether there is a property in Primary, if there is s
			if (Reflect.has(target, key)) {
				return Reflect.set(target, key, value, receiver);
			}
			// If not, we set the property in Fallback
			if (Reflect.has(fallback, key)) {
				return Reflect.set(fallback, key, value, receiver);
			}
			// If there are no properties anywhere that it is not established
			return false;
		},
	}) as T & F;
}
```

Great, now we can use this function on objects:

<<< @/tests/patterns/composite-proxy.test.ts#composite-object-test

## Extending of native interfaces

Here is an example of how we can expand native interfaces in a composite proxy:

```ts
// Indicate Typescript to extend native interfaces
export interface Transaction extends IDBTransaction {}
export class Transaction {
	// Save the original object
	protected __trx: IDBTransaction;

	constructor(trx: IDBTransaction) {
		this.__trx = trx;
		// Return composite
		return createCompositeProxy(this, trx);
	}

	get stores() {
		return Array.from(this.objectStoreNames);
	}

	store(name?: string) {
		if (!name && this.stores.length !== 1) {
			throw new NoStoreProvidedError(this.db.name);
		}
		return new Store(this.objectStore(name ?? this.stores[0]));
	}
}

const trx = new Transatction(/* Транзакция тут */);
trx.stores; // ['store1', 'store2']
trx.abort(); // Working method of original transaction
```

If you want to see composite proxies in the case, you can get acquainted with my library [@sx3/database](https://sx-3.github.io/database/)
