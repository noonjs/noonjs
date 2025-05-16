// test/index.test.ts
import Noonjs from '../src';

// Mock mongodb connection to avoid real DB connection during tests
jest.mock('../src/mongodb', () => {
    return jest.fn((uri: string, cb: Function) => {
        process.nextTick(() => cb('connected', null)); // simulate successful connection
    });
});

// Mock loadEnv to control env config merging
jest.mock('../src/load-env', () => ({
    loadEnv: jest.fn(() => ({
        port: 1234,
        debug: "env-debug",
    }))
}));



describe("Noonjs constructor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    test("loads env config and merges with user config and defaults", () => {
        const config = {
            collections: {
                users: { schema: {}, permissions: {} }
            },
            mongodb: 'mongodb://fake-uri', // required, or constructor throws
            port: 4000,
        };
        const instance = new Noonjs(config);
        
        // Check that env config overrides user config for these keys
        expect(instance.config.port).toBe(1234);
        expect(instance.config.debug).toBe("env-debug");

        // User config keys remain
        expect(instance.config.mongodb).toBe('mongodb://fake-uri');
        expect(instance.config.collections).toHaveProperty('users');

        // Clean up: close server & socket connections if any
        instance.stop();
    });


    test("sets default auth.access if auth object provided but access missing", () => {
        const config = {
            collections: { users: { schema: {}, permissions: {} } },
            mongodb: 'mongodb://fake-uri',
            auth: {
                collection: "users",
                secret: "testsecret"
                // access omitted here
            }
        };

        const instance = new Noonjs(config);

        expect(instance.config.auth!.access).toBe(900);  // default was set

        instance.stop();
    });


    test("should throw error if collection's length is zero", () => {
        const config = {
            collections: {},
            mongodb: 'mongodb://fake-uri',
            auth: {
                collection: "users",
                secret: "testsecret"
                // access omitted here
            }
        };

        const createInstance = () => new Noonjs(config);

        expect(createInstance).toThrow("no_collection")
    });


    test("should throw error if mongodb is not defiend", () => {
        const config = {
            collections: { users: { schema: {}, permissions: {} } },
            auth: {
                collection: "users",
                secret: "testsecret"
                // access omitted here
            }
        };

        const createInstance = () => new Noonjs(config);

        expect(createInstance).toThrow("no_mongodb_uri")
    });

    test("should throw error if mongodb is an empty string", () => {
        const config = {
            mongodb: "",
            collections: { users: { schema: {}, permissions: {} } },
            auth: { collection: "users", secret: "testsecret" }
        };

        expect(() => new Noonjs(config)).toThrow("no_mongodb_uri");
    });


    test("merges default, user, and env config correctly", () => {
        const config = {
            collections: { users: { schema: {}, permissions: {} } },
            mongodb: 'mongodb://fake-uri',
            port: 4000,
            debug: "user-debug",
            auth: {
                collection: "users",
                secret: "testsecret",
                access: 600
            }
        };

        const instance = new Noonjs(config);

        // Expect env config to override user config
        expect(instance.config.port).toBe(1234);
        expect(instance.config.debug).toBe("env-debug");

        // Expect other user values to remain unchanged
        expect(instance.config.mongodb).toBe('mongodb://fake-uri');
        expect(instance.config.auth?.access).toBe(600);
        expect(instance.config.collections).toHaveProperty("users");

        instance.stop();
    });




});


