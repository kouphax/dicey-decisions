import "./App.css";
import {useEffect, useReducer, useState} from "react";
import * as R from "ramda";
import {useSwipeable} from "react-swipeable";

// == TYPES ========================================================================================
type Die = {
    value: number;
    face: string;
};

type Action =
    | { type: "add" } & HistoryEntry
    | { type: "next", date: string }
    | { type: "previous", date: string };

type HistoryEntry = {
    dice: Die[];
    date: string;
};

type History = { [key: string]: HistoryEntry };

type State = {
    current: HistoryEntry;
    history: History;
}

const dieStream = (function* dieGenerator(): Generator<Die> {
    const faces: Die[] = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]
        .map((face, index) => ({
            face,
            value: index + 1,
        }));

    while (true) {
        yield faces[Math.floor(Math.random() * faces.length)];
    }
})();

function historyReducer(state: State, action: Action): State {
    switch (action.type) {
        case "add":
            const entry = {
                dice: action.dice,
                date: action.date,
            }

            return {
                ...state,
                current: entry,
                history: {
                    ...state.history,
                    [action.date]: entry,
                },
            };
        case "next":
            const next = nextDate(action.date, state.history);
            if(next != undefined) {
                return {
                    ...state,
                    current: next,
                };
            }
            break;
        case "previous":
            const previous = previousDate(action.date, state.history);
            if(previous != undefined) {
                return {
                    ...state,
                    current: previous,
                };
            }
            break;

    }
    return state;
}

function Dice({dice}) {
    return <>
        {
            dice.map((die, idx) => <div className="die" key={`die-${idx}`}>{die.face}</div>)
        }
    </>
}

function nextDate(date: string, history: History): HistoryEntry {

    const dates = R.pipe(R.keys, R.sortBy(R.identity))(history);
    const idx = R.findIndex(R.equals(date))(dates)

    if(idx === -1 || idx === dates.length - 1) {
        return undefined;
    }

    return history[dates[R.inc(idx)]]
}

function previousDate(date: string, history: History): HistoryEntry {

    const dates = R.pipe(R.keys, R.sortBy(R.identity))(history);
    const idx = R.findIndex(R.equals(date))(dates)

    if(idx === -1 || idx === 0) {
        return undefined;
    }

    return history[dates[R.dec(idx)]]
}

export function App() {
    const [state, dispatch] = useReducer(historyReducer, {}, () => {
        const value: string = window.localStorage.getItem("dicey-decisions");
        return value ? JSON.parse(value) : { history: {} };
    });

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        window.localStorage.setItem("dicey-decisions", JSON.stringify({
            ...state,
            current: state.history[today]
        }));
    }, [state]);

    if(!state.history[today]) {
        dispatch({
            type: "add",
            dice: R.times(() => dieStream.next().value, 2),
            date: today,
        })
    }

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            dispatch({
                type: "next",
                date: state.current.date,
            })
        },
        onSwipedRight: () => {
            dispatch({
                type: "previous",
                date: state.current.date,
            })
        },
    });

    return <div {...handlers} className="screen">
        <div className="dice">
            { !!state.current && <Dice dice={state.current.dice}/> }
        </div>
    </div>
}
