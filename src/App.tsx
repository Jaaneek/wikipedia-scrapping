import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import SearchList from "components/SearchList";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ColorModeSwitcher justifySelf="flex-end" />
    <SearchList></SearchList>
  </ChakraProvider>
);
