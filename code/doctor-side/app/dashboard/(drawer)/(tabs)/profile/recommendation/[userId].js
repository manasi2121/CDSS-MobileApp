import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { ScrollView } from "react-native-gesture-handler";
import {
  PRIMARY,
  THIRD,
  FOURTH,
  SECONDARY,
} from "../../../../../../styles/global";
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

export default function Recommendation() {
  const [userDetails, setUserDetails] = useState(null);
  const { userId } = useLocalSearchParams();
  const isFocused = useIsFocused();

  const fetchUser = async () => {
    const admin = auth().currentUser;

    if (admin) {
      // Admin is signed in, find the user's (patient's) document from firestore.
      firestore()
        .collection("users")
        .doc(userId)
        .onSnapshot((docSnap) => {
          setUserDetails({
            uid: userId,
            ...docSnap.data(),
          });
        });
    } else {
      // No admin is signed in. redirect to login.
      // console.log("No user is currently signed in");
      router.replace("/Login");
    }
  };

  useEffect(() => {
    // When the screen is in focus, fetch the user's details. When its not, reset the state
    isFocused && fetchUser();
    !isFocused && setUserDetails(null);
  }, [isFocused]);

  const handleDeletion = (elem) => {
    Alert.alert(
      "Confirm deletion",
      `Are you sure you want to delete the medicine "${elem.name}"`,
      [
        {
          text: "Delete",
          onPress: () => {
            try {
              firestore()
                .collection("users")
                .doc(userId)
                .update({
                  medicines: firestore.FieldValue.arrayRemove(elem),
                });
            } catch (err) {
              alert(err);
            }
          },
        },
        {
          text: "Cancel",
          onPress: () => {},
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
      {/* If loading is true or user has not been fetched, show the activity indicator */}
      {!userDetails ? (
        <ActivityIndicator size={"large"} color={PRIMARY} style={{ flex: 1 }} />
      ) : (
        <View style={styles.container}>
          <View style={styles.medicinesContainer}>
            <Text style={[styles.text, styles.sectionHeader]}>Medication</Text>
            {userDetails.medicines.map((elem, index) => (
              <View style={styles.eachMedicine} key={index}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  activeOpacity={0.5}
                  onPress={() => handleDeletion(elem)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color={"#eb2f45"}
                  />
                </TouchableOpacity>
                {/* In medicines - name, type, frequency are compulsory */}
                {elem.type === "Tablet" ? (
                  <FontAwesome5 name="tablets" size={30} color="black" />
                ) : (
                  <FontAwesome5 name="capsules" size={30} color="black" />
                )}
                <View style={styles.medcineDetails}>
                  {elem.name && (
                    <Text style={[styles.text, styles.medicineName]}>
                      {elem.name}
                    </Text>
                  )}
                  <Text style={[styles.text, styles.medicineDesc]}>
                    {/* display strength only if it exists. */}
                    {elem.type}
                    {elem.strength ? ", " + elem.strength : ""}
                  </Text>
                  <Text style={[styles.text, styles.medicineDesc]}>
                    {elem.frequency}
                  </Text>
                  {elem.when && (
                    <Text style={[styles.text, styles.medicineDesc]}>
                      {elem.when && elem.when.join(", ")}
                    </Text>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.5}
              onPress={() => {
                router.push({
                  pathname: "dashboard/profile/recommendation/addMedicine",
                  params: { userId },
                });
              }}
            >
              <Text style={[styles.text, styles.addBtnText]}>
                Add Medication
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: FOURTH,
  },
  text: {
    fontFamily: "Inter_400Regular",
  },
  medicinesContainer: {
    width: "100%",
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  eachMedicine: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  deleteBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 10,
  },
  medcineDetails: {
    flexShrink: 1,
  },
  medicineName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 5,
  },
  medicineDesc: {
    color: SECONDARY,
    fontSize: 12,
    marginBottom: 2,
  },
  addBtn: {
    width: "100%",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    backgroundColor: "#fff",
  },
  addBtnText: {
    color: PRIMARY,
    fontFamily: "Inter_500Medium",
  },
});
