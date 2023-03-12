import { ThemeProvider } from "~theme"

import Options from "./components/options"

function IndexPopup() {
  return (
    <ThemeProvider>
      <Options></Options>
    </ThemeProvider>
  )
}

export default IndexPopup
