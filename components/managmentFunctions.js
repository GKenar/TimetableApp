import { AsyncStorage } from "react-native";

//Нужно очищать кэш
export const logOut = () => {
  return AsyncStorage.removeItem("userToken");
};

export const getToken = () => {
  return AsyncStorage.getItem("userToken");
};

export const writeToken = token => {
  return AsyncStorage.setItem("userToken", token);
};
