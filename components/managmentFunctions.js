import { AsyncStorage } from "react-native";

//Нужно очищать кэш
export const logOut = () => {
  AsyncStorage.removeItem("userToken").then(() =>
    this.props.navigation.navigate("Auth")
  );
};

export const getToken = () => {
    AsyncStorage.getItem("userToken");
}