import * as R from "ramda";

export const DATA_KEY = "dicey-decisions"

const migrations = [
    {
        version: 1,
        description: "basically ensures that the version is added and persisted",
        migrate(state) {
            return { history:[], ...state };
        }
    }
]

export function read() {
    return R.reduce((state, migration) => {
            if (migration.version > state.version) {
                console.log(`Migrating from version ${state.version} to ${migration.version}: ${migration.description}`)
                return {...migration.migrate(state), version: migration.version}
            } else {
                return state;
            }
        },
        {version: 0, ...JSON.parse(localStorage.getItem(DATA_KEY) || "{}")},
        migrations)
}

export function write(state) {
    localStorage.setItem(DATA_KEY, JSON.stringify(state))
}