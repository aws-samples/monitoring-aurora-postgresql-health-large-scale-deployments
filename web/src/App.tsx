import "@cloudscape-design/global-styles/index.css";
import Layout from "./components/layout/Layout";

import { Amplify } from 'aws-amplify';


const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: {
      "myRestApi": {
        endpoint: 'backEndURL'
      }
    }
  },
});

function App() {
  return (
    <Layout />
  );
}

export default App;
