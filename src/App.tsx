import { PageTabs } from "./components/PageTabs.tsx";
import { pagesConfig } from "./pagesConfig.ts";

export default  function App() {
  return <PageTabs items={pagesConfig} />;
}
