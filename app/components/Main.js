import React, { useContext, useEffect, Fragment, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Login from "./auth/Login";
import BottomNavigator from "./layouts/bottomNavigator";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-community/async-storage";
import Update from "../components/Update/Update";
import { URL } from "../config";
import { StyleSheet, View } from "react-native";
import LoginStack from "./OTP/LoginStack";

const Stack = createStackNavigator();

const Main = () => {
  const [loading, setLoading] = useState(false);
  const { authState, getUser, setAuthState, initialState } =
    useContext(AuthContext);
  const { isLoggedIn, user } = authState;
  const [updateObj, setUpdateObj] = useState({
    update: false,
  });
  const url = URL;
  const abcd = url + "/update/view/";

  const getJwt = async () => {
    const jwt = AsyncStorage.getItem("@jwt");
    return jwt;
  };
  const getUpdates = async () => {
    const res = await axios.get(abcd);
    console.log(res.data.data);
    setUpdateObj(res.data.data);
  };
  useEffect(() => {
    setLoading(true);
    getUpdates();
    AsyncStorage.getItem("@jwt").then((jwt) => {
      console.log("JWT:" + jwt);
      if (jwt) {
        const verified = axios
          .get(URL + "/auth/login", {
            headers: {
              "auth-token": jwt,
            },
          })
          .then((verified) => {
            if (verified.data.success === "true") {
              setAuthState({ ...authState, isLoggedIn: true, token: jwt });
              setLoading(false);
            } else {
              setAuthState(initialState);
              setLoading(false);
            }
          });
      } else {
        setAuthState(initialState);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    console.log(authState);
  }, [authState]);

  // if (!updateObj?.status) {
  // if (user.rank === '0' || user.rank === '1' || user.rank === '2') {
  return (
    <Fragment>
      {!loading ? (
        !isLoggedIn ? (
          <LoginStack />
        ) : (
          <BottomNavigator />
        )
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <ActivityIndicator
            animating={true}
            size="large"
            style={{ alignSelf: "center" }}
          />
        </View>
      )}
    </Fragment>
  );
  // } else {
  //   return <Update updateObj={updateObj} />;
  // }
};

// } else {
//   return (
//     <View style={styles.container}>
//       <ActivityIndicator
//         animating={true}
//         size='large'
//         style={styles.loading}
//       />
//     </View>
//   );
// }

// return <BottomNavigator />;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  loading: {
    alignSelf: "center",
  },
});
export default Main;
