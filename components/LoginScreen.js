import React from "react";
import {
  StyleSheet,
  View,
  AsyncStorage,
  Animated,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Header, Text, Button, SocialIcon } from "react-native-elements";
import { Mutation, Query } from "react-apollo";
import { AUTH } from "../queries/authentification";
import { writeToken } from "./managmentFunctions";
import gql from "graphql-tag";

//Сделать, чтобы не исчезала, а становилась невидимой или что-то подобное
class ErrorForm extends React.Component {
  state = {
    flashAnim: new Animated.Value(0)
  };

  componentDidMount() {
    Animated.timing(this.state.flashAnim, {
      toValue: 1,
      duration: 500
    }).start();
  }

  render() {
    const { flashAnim } = this.state;

    return (
      <Animated.View
        style={{
          opacity: flashAnim,
          backgroundColor: "red",
          paddingLeft: 5,
          paddingRight: 5
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

class AuthForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userLogin: "pustovalov",
      userPassword: "BQzJ9",
      handling: false,
      invalidUser: false
    };
  }

  render() {
    return (
      <Mutation
        mutation={gql(AUTH)}
        update={(cache, { data }) => {
          console.log(data);
          const token = data.authenticate.jwtToken;
          if (token) {
            console.log("Writing to store... " + token);

            writeToken(token).then(() => {
              this.props.navigation.navigate("App");
            });
          } else {
            this.setState({ invalidUser: true, handling: false });
          }
        }}
      >
        {(logIn, { loading, error }) => (
          <View style={{ flex: 1, alignItems: "center" }}>
            {this.state.invalidUser ? (
              <ErrorForm style={{ marginBotton: 5 }}>
                <Text style={{ textAlign: "center", fontSize: 22 }}>
                  Неверный логин или пароль
                </Text>
              </ErrorForm>
            ) : null}
            {this.state.handling ? <ActivityIndicator /> : null}
            <Input
              placeholder="Login"
              shake={true}
              leftIcon={
                <Icon name="user" type={"simple-line-icon"} size={32} />
              }
              value={this.state.userLogin}
              onChangeText={text => this.setState({ userLogin: text })}
            />
            <Input
              placeholder="Password"
              shake={true}
              secureTextEntry={true}
              inputContainerStyle={{ marginBottom: 30 }}
              leftIcon={
                <Icon name="lock" type={"simple-line-icon"} size={32} />
              }
              value={this.state.userPassword}
              onChangeText={text => this.setState({ userPassword: text })}
            />
            <Button
              title="Войти"
              titleStyle={{ fontWeight: "700", fontSize: 24 }}
              buttonStyle={{
                backgroundColor: "rgba(92, 99,216, 1)",
                width: 300,
                height: 45,
                borderWidth: 0,
                borderRadius: 5
              }}
              containerStyle={{ marginTop: 20 }}
              onPress={() => {
                this.setState({ invalidUser: false, handling: true });
                console.log(
                  `${this.state.userLogin}; ${this.state.userPassword}`
                );
                logIn({
                  variables: {
                    login: this.state.userLogin,
                    password: this.state.userPassword
                  }
                });
              }}
            />
          </View>
        )}
      </Mutation>
    );
  }
}

export default class LoginScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Header
          centerComponent={
            <Text h3 style={{ color: "white" }}>
              Woundup
            </Text>
          }
        />
        <View style={styles.loginContainer}>
          <Text
            h4
            style={{ marginBottom: 10, marginTop: 30, textAlign: "center" }}
          >
            Вход в аккаунт
          </Text>
          <AuthForm {...this.props} />
        </View>
        {/*
        <View style={styles.oauthForm}>
           <Text h4>or sign in with:</Text>
          <View flexDirection="row">
            <SocialIcon
              type="facebook"
              onPress={() => console.log("facebook pressed")}
            />
            <SocialIcon type="twitter" />
            <SocialIcon type="steam" />
          </View> 
        </View>
        */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "stretch",
    justifyContent: "center"
  },
  loginContainer: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "space-between",
    marginTop: 10
  },
  oauthForm: {
    flex: 0.2,
    alignItems: "center"
  }
});
