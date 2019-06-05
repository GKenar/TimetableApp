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
import gql from "graphql-tag";

const AUTH = gql`
  mutation Authentification($login: String!, $password: String!) {
    authenticate(input: { login: $login, password: $password }) {
      clientMutationId
      jwtToken
    }
  }
`;

// const TEST_QUERY = gql`
//   query {
//     allAccounts {
//       nodes {
//         login
//       }
//     }
//   }
// `;

// const TestQuery = () => (
//   <Query query={TEST_QUERY}>
//     {({ data, error, loading }) => {
//       if (!loading) console.log(data);
//       return null;
//     }}
//   </Query>
// );

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
      userLogin: "", //Не имя, а логин
      userPassword: "",
      handling: false,
      invalidUser: false
    };
  }

  render() {
    return (
      <Mutation
        mutation={AUTH}
        update={(cache, { data }) => {
          console.log(data);
          const token = data.authenticate.jwtToken;
          if (token) {
            //Токен null в самом начале
            console.log("Writing to store... " + token);

            //Можно вынести обращения к store в отдельный модуль
            AsyncStorage.setItem("userToken", token).then(() => {
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
                <Text h4 style={{ textAlign: "center" }}>
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
              inputContainerStyle={{ marginBottom: 30 }}
              leftIcon={
                <Icon name="lock" type={"simple-line-icon"} size={32} />
              }
              value={this.state.userPassword}
              onChangeText={text => this.setState({ userPassword: text })}
            />
            <Button
              title="Sign in with vk"
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
            <Text h2 style={{ color: "white" }}>
              LogIn
            </Text>
          }
        />
        <View style={styles.loginContainer}>
          <Text h3 style={{ marginBottom: 30, textAlign: "center" }}>
            Timetable App
          </Text>
          <AuthForm {...this.props} />
        </View>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "stretch",
    justifyContent: "space-between"
  },
  loginContainer: {
    flex: 0.5,
    alignItems: "stretch",
    justifyContent: "space-around"
  },
  oauthForm: {
    flex: 0.2,
    alignItems: "center"
  }
});
