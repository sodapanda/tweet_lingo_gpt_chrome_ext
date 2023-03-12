import { ThemeProvider } from "~theme"

import Options from "./components/options"

function IndexPopup() {
  return (
    <ThemeProvider>
      <Options onSaveConfig={()=>{
        window.close();
      }}></Options>
    </ThemeProvider>
  )
}

export default IndexPopup
