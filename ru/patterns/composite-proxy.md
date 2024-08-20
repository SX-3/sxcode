# Композитный прокси

Данный паттерн я использовал при разработке [@sx3/database](https://sx-3.github.io/database/).
Скорее всего он встречается и в других проектах в несколько ином виде.

## Техники расширения

Бывают ситуации когда требуется расширить объект или нативный интерфейс
что бы перезаписать пару функций но сделать это напрямую нельзя, например:

```ts twoslash
class Databse extends IDBDatabase {}
```

Такой код выдаст ошибку `Illegal constructor`.
Какие ещё варианты есть? Прбросить все свойства объекта:

::: details Много кода

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

Очевидно что это плохой вариант как из-за количества кода, так и из-за того что приходится дублировать логику.
Было бы неплохо вызывать методы и свойства которые есть в исходном классе, и передавать управление в фоллбек объект если свойства или метода нет.
К счастью в JavaScript есть [Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

## Создание композитного прокси

[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy) позволяет отслеживать обращение к свойствам объекта. Соотвественно концепция/паттерн композитного прокси проста, он с смотрит есть ли свойство в первом объекте, если есть работаем с ним, если нет вызываем это свойство во втором объекте. Итак давайте уже писать код, вот функция создание композитного прокси:

```ts twoslash
// primary - наш первичный объект
// fallback - объект для проброса не реализованных свойств
export function createCompositeProxy<T extends Object, F extends Object>(
	primary: T,
	fallback: F
): T & F {
	// Оборачиваем объект в Proxy
	return new Proxy(primary, {
		// Ловушка get позволяет перехватывать обращение к свойству
		get(target, key, receiver) {
			// Проверяем есть ли свойство в primary, если есть возвращаем его
			if (Reflect.has(target, key)) {
				return Reflect.get(target, key, receiver);
			}

			// Если нет возвращаем свойство из fallback
			if (Reflect.has(fallback, key)) {
				let value = Reflect.get(fallback, key, fallback);
				// Привязываем правильный контекст если это метод
				if (typeof value === "function") return value.bind(fallback);
				return value;
			}
		},

		// Ловушка set позволяет перехватывать установку свойства
		set(target, key, value, receiver) {
			// Проверяем есть ли свойство в primary, если есть устанавливаем
			if (Reflect.has(target, key)) {
				return Reflect.set(target, key, value, receiver);
			}
			// Если нет устанавливаем свойство в fallback
			if (Reflect.has(fallback, key)) {
				return Reflect.set(fallback, key, value, receiver);
			}
			// Если свойства нигде нет возращаем что оно не установлено
			return false;
		},
	}) as T & F;
}
```

Отлично, теперь мы можем использовать эту функцию на объектах:

<<< @/tests/patterns/composite-proxy.test.ts#composite-object-test

## Расширение нативных интерфейсов

Вот пример как мы можем расширить нативные интерфейсы в композитном прокси:

```ts
// Указываем typescript что бы расширяем нативные интерфейсы
export interface Transaction extends IDBTransaction {}
export class Transaction {
	// Сохраняем оригинальный объект
	protected __trx: IDBTransaction;

	constructor(trx: IDBTransaction) {
		this.__trx = trx;
		// Возвращаем composite
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
trx.abort(); // Рабочий метод оригинальной транзакции
```

Если вам увидеть композитные прокси в деле вы можете ознакомится с моей библиотекой [@sx3/database](https://sx-3.github.io/database/)
