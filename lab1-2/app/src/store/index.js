import { configureStore } from "@reduxjs/toolkit";
import restoredFunctionsReducer from "./restoredFunctionsSlice";

const store = configureStore({
    reducer: {
        restoredFunctions: restoredFunctionsReducer
    }
});

export default store;