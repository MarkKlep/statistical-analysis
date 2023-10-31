import { createSlice } from "@reduxjs/toolkit";

const restoredFunctionsSlice = createSlice({
    name: 'restoredFunctions',
    initialState: {
        distributionDensityFunc: [],
        empericalDistributionFunc: [],
        linearizedFunc: [],
        m: 0,
        sigma: 0
    },
    reducers: {
        getDistributionDensityFunc: (state, action) => {
            state.distributionDensityFunc = action.payload;
        },
        getEmpericalDistributionFunc: (state, action) => {
            state.empericalDistributionFunc = action.payload;
        },
        getLinearizedFunc: (state, action) => {
            state.linearizedFunc = action.payload;
        },
        getM: (state, action) => {
            state.m = action.payload;
        },
        getSigma: (state, action) => {
            state.sigma = action.payload;
        }
    }
});

export const {getDistributionDensityFunc, getEmpericalDistributionFunc, getLinearizedFunc, getM, getSigma} = restoredFunctionsSlice.actions;
export default restoredFunctionsSlice.reducer;