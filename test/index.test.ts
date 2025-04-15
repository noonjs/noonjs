import Noonjs from '../src';

describe("Noonjs", () => {
    let noonjs: Noonjs;

    beforeEach(() => {
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
})