import { describe, expect, it } from "vitest";

export function createCompositeProxy<T extends Object, F extends Object>(
	primary: T,
	fallback: F
): T & F {
	return new Proxy(primary, {
		get(target, key, receiver) {
			if (Reflect.has(target, key)) return Reflect.get(target, key, receiver);
			if (Reflect.has(fallback, key)) {
				let value = Reflect.get(fallback, key, fallback);
				if (typeof value === "function") return value.bind(fallback);
				return value;
			}
		},
		set(target, key, value, receiver) {
			if (Reflect.has(target, key)) {
				return Reflect.set(target, key, value, receiver);
			}
			if (Reflect.has(fallback, key)) {
				return Reflect.set(fallback, key, value, receiver);
			}
			return false;
		},
	}) as T & F;
}

describe("objects", () => {
	// #region composite-object-test
	it("props", () => {
		const primary = { name: "primary" };
		const fallback = { name: "fallback", age: 100 };
		const composite = createCompositeProxy(primary, fallback);

		expect(composite.name).toBe("primary");
		expect(composite.age).toBe(100);
	});
	// #endregion composite-object-test
});
