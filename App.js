import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  WorkSans_100Thin,
  WorkSans_300Light,
  WorkSans_400Regular,
  WorkSans_700Bold,
  WorkSans_400Regular_Italic,
} from "@expo-google-fonts/dev";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoadingSkeleton = (props) => {
  return (
    <View
      style={{
        margin: 16,
        alignItems: "center",
      }}
    >
      <ActivityIndicator size={96} color="black" />
    </View>
  );
};

const Homepage = (props) => {
  const [word, setWord] = useState("");
  const [fetchedData, setFetchedData] = useState(undefined);
  const [isFetched, setIsFetched] = useState(null);
  const [sound, setSound] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [IsLoadedRecent, setIsLoadedRecent] = useState(false);

  useEffect(() => {
    const getRecentsList = async () => {
      try {
        // AsyncStorage.clear();
        const values = await AsyncStorage.getItem("@recent-queries");
        if (values !== null) {
          setRecentQueries(JSON.parse(values));
          setTimeout(() => {
            setIsLoadedRecent(true);
          }, 2500);
        }
      } catch (e) {
        console.log(e);
      }
    };

    getRecentsList();
  }, []);

  if (isFetched == null) {
    return (
      <View
        style={{
          padding: 16,
          justifyContent: "flex-start",
          flexGrow: 1,
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontFamily: "WorkSans_700Bold",
          }}
        >
          TakeADict
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              width: "85%",
              height: 50,
              fontFamily: "WorkSans_400Regular",
              borderWidth: 1,
              borderColor: "black",
              fontSize: 16,
              padding: 8,
              borderRadius: 8,
            }}
            placeholder="Search for a word"
            onChangeText={(wordInput) => {
              setWord(wordInput);
            }}
            defaultValue={word}
          />
          <Pressable
            style={{
              marginHorizontal: 8,
            }}
            onPress={() => {
              const fetchData = async () => {
                setIsFetched(false);
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                  .then((response) => response.json())
                  .then((data) => {
                    setFetchedData(data);
                    setIsFetched(true);
                  });

                try {
                  let tempArray = recentQueries;
                  tempArray.push(word);
                  setRecentQueries(tempArray);
                  await AsyncStorage.setItem(
                    "@recent-queries",
                    JSON.stringify(recentQueries)
                  );
                } catch (e) {
                  console.log(e);
                }
              };

              fetchData();
            }}
          >
            <Ionicons
              name="search"
              size={32}
              style={{
                borderColor: "black",
                borderWidth: 1,
                padding: 7,
                borderRadius: 8,
              }}
              color="black"
            />
          </Pressable>
        </View>
        <View
          style={{
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "WorkSans_700Bold",
              fontSize: 28,
            }}
          >
            Recents
          </Text>
          {IsLoadedRecent ? (
            <>
              {recentQueries.map((elem, idx) => (
                <Text
                  style={{
                    fontFamily: "WorkSans_400Regular",
                    fontSize: 20,
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                  }}
                  key={idx}
                >
                  {elem}
                </Text>
              ))}
            </>
          ) : (
            <ActivityIndicator size={64} color={"black"} />
          )}
        </View>
      </View>
    );
  } else if (isFetched == false) {
    return (
      <View
        style={{
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <LoadingSkeleton />
      </View>
    );
  } else {
    return (
      <View
        style={{
          padding: 24,
        }}
      >
        <Pressable onPress={() => setIsFetched(null)}>
          <Ionicons name="arrow-back" size={24} />
        </Pressable>
        <Text
          style={{
            fontFamily: "WorkSans_700Bold",
            fontSize: 56,
          }}
        >
          {fetchedData[0].word}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name={"play"}
            size={24}
            color="#4F46E5"
            onPress={() => {
              console.log("SOUND");
            }}
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "WorkSans_300Light",
              marginHorizontal: 8,
              color: "grey",
            }}
          >
            {fetchedData[0].phonetic}
          </Text>
        </View>
        <ScrollView
          style={{
            flexGrow: 1,
          }}
        >
          {fetchedData[0].meanings.map((objects, index) => (
            <View key={index} style={{}}>
              <Text
                style={{
                  fontFamily: "WorkSans_400Regular",
                  fontSize: 32,
                }}
              >
                {objects.partOfSpeech}
              </Text>
              {objects.definitions.slice(0, 3).map((elem, idx) => (
                <View
                  style={{
                    paddingVertical: 8,
                  }}
                  key={idx}
                >
                  <Text style={{ fontFamily: "WorkSans_400Regular" }}>
                    {elem.definition}
                  </Text>
                  {elem.example != undefined ? (
                    <Text
                      style={{
                        fontFamily: "WorkSans_400Regular_Italic",
                        color: "#A8A29E",
                      }}
                    >
                      {elem.example}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
};

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    WorkSans_100Thin,
    WorkSans_300Light,
    WorkSans_400Regular,
    WorkSans_700Bold,
    WorkSans_400Regular_Italic,
  });

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="white" style="dark" />
      <SafeAreaView
        style={{
          backgroundColor: "#FBFAFF",
          flexGrow: 1,
        }}
      >
        <Homepage />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
