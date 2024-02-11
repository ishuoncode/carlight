'use client';

import { Provider } from 'react-redux';
import { store } from "./redux/store";
import { SessionProvider } from 'next-auth/react';
// import { persistStore} from 'redux-persist'
// import { PersistGate } from 'redux-persist/integration/react';

export default function provider({ children,session }) {
//   let persistor = persistStore(store);
  return (
    <SessionProvider session={session}>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      {children}
       {/* </PersistGate> */}
    </Provider>
    </SessionProvider>
  );
}
