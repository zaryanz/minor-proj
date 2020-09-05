import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../context/AuthContext";
import Login from "./auth/Login";
import Home from "./routes/Home";
import BottomNavigator from "./bottomNavigator";

const Stack = createStackNavigator();

const Main = () => {
  const { authState } = useContext(AuthContext);
  const { isLoggedIn, loading } = authState;

  useEffect(() => {
    console.log(authState);
  }, [authState]);

  if (loading) {
    return <h1>Hi</h1>;
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <Stack.Screen name="Login" component={Login} />
          ) : (
            <Stack.Screen name="Home" component={BottomNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};

export default Main;
