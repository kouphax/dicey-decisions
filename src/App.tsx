import "./App.css";
import {useEffect, useReducer} from "react";
import * as R from "ramda";

// == TYPES ========================================================================================
type Die = {
    value: number;
    face: string;
};

type Action = { type: "add" } & HistoryEntry;

type HistoryEntry = {
    dice: Die[];
    date: string;
};

type History = { [key: string]: HistoryEntry };

const dieStream = (function* dieGenerator(): Generator<Die> {
    const faces: Die[] = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"].map((face, index) => ({
        face,
        value: index + 1,
    }));

    while (true) {
        yield faces[Math.floor(Math.random() * faces.length)];
    }
})();

function historyReducer(history: History, action: Action): History {
    switch (action.type) {
        case "add":
            return {
                ...history,
                [action.date]: {dice: action.dice, date: action.date},
            };
        default:
            return history;
    }
}

function Dice({dice}) {
    return <>
        {
            dice.map((die, idx) => <div className="die" key={`die-${idx}`}>{die.face}</div>)
        }
    </>
}

export function App() {
    const [state, dispatch] = useReducer(historyReducer, {}, () => {
        const value: string = window.localStorage.getItem("dicey-decisions");
        return value ? JSON.parse(value) : {};
    });

    useEffect(() => {
        window.localStorage.setItem("dicey-decisions", JSON.stringify(state));
    }, [state]);

    const today = new Date().toISOString().slice(0, 10);

    const previous: HistoryEntry[] = R.pipe(
        R.dissoc(today),
        R.values,
        R.sortBy(R.prop("date")))(state);

    if(!state[today]) {
        dispatch({
            type: "add",
            dice: [dieStream.next().value, dieStream.next().value],
            date: today,
        })
    }

    return <div className="screen">
        <div className="dice">
            {
                !!state[today] && <Dice dice={state[today].dice}/>
            }
        </div>
    </div>
    //
    // if (!state[today]) {
    //     return (
    //         <>
    //             <h1>
    //                 <button
    //                     onClick={() =>
    //                         dispatch({
    //                             type: "add",
    //                             dice: [dieStream.next().value, dieStream.next().value],
    //                             date: today,
    //                         })
    //                     }
    //                 >
    //                     Roll for the day
    //                 </button>
    //             </h1>
    //             {
    //                 previous.map(({dice, date}) => (
    //                     <div key={date}>
    //                         <h2>{dice.map((d) => d.face).join(" ")}</h2>
    //                     </div>
    //                 ))
    //             }
    //         </>
    //     );
    // } else {
    //     const renderDice = R.pipe(
    //         R.path([today, "dice"]),
    //         R.map(R.prop("face")),
    //         R.join(" ")
    //     );
    //     return (
    //         <>
    //             <h1>{renderDice(state)}</h1>
    //
    //             {
    //                 previous.map(({dice, date}) => (
    //                     <div key={date}>
    //                         <h2>{dice.map((d) => d.face).join(" ")}</h2>
    //                     </div>
    //                 ))
    //             }
    //
    //         </>
    //     );
    // }
}
