import Noonjs from '../src';

describe("Noonjs", () => {
    let noonjs: Noonjs;

    beforeAll(() => {
        noonjs = new Noonjs({
            collections: {
                "users": {
                    schema: {},
                    permissions: {}
                }
            }
        });
    });

    test("Created!", () => {
        expect(noonjs).toBeDefined()
    });

    afterAll(() => {
        noonjs.stop()
    })
})