import "@cloudscape-design/global-styles/index.css";
import Layout from "./components/layout/Layout";

import { Amplify } from 'aws-amplify';
import { apiGatewayUrl as API_URL } from "../../server/api-url.json";

const existingConfig = Amplify.getConfig();

Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: {
      "myRestApi": {
        endpoint: API_URL
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
