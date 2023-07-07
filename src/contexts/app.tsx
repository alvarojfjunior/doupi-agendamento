import LoadingModal from "@/components/LoadingModal";
import { useDisclosure } from "@chakra-ui/react";
import {
  createContext,
} from "react";

interface AppContextProps {
  children: React.ReactNode;
}

interface IAppContextData {
  onOpenLoading: Function;
  onCloseLoading: Function;
}

export const AppContext = createContext<IAppContextData>({} as IAppContextData);

export const AppProvider: React.FC<AppContextProps> = ({ children}) => {
  const {
    isOpen: isLoading,
    onOpen: onOpenLoading,
    onClose: onCloseLoading,
  } = useDisclosure();

  return (
    <AppContext.Provider value={{
      onOpenLoading,
      onCloseLoading,
    }}>
      <LoadingModal isOpen={isLoading} />
      {children}
    </AppContext.Provider>
  );
};

