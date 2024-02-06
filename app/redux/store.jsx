import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './slices/cartSlice'

export const store = configureStore({
    reducer: { cart: cartSlice, } // Use cartReducer instead of counterReducer
})

// export const RootState = typeof store.getState;
// export const AppDispatch = typeof store.dispatch;

export default store
