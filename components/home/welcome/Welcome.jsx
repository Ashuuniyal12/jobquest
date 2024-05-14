import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "./welcome.style";
import { icons, SIZES } from "../../../constants";
import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from 'expo-file-system';

const jobTypes = ["Full-time", "Part-time", "Contractor"];

const Welcome = ({ searchTerm, setSearchTerm, handleClick }) => {
  const router = useRouter();
  const [activeJobType, setActiveJobType] = useState("Full-time");
  const [showUpload, setShowUpload] = useState(false);
  const handleUploadResume = async () => {
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      console.log(docRes);
      if (docRes.canceled) {
        console.error("Document picker operation was cancelled");
        return;
      }
      console.log();

      const { name, size } = docRes.assets[0].file;
      const uri = docRes.assets[0].uri;
      const mimeType = docRes.assets[0].mimeType;

      const fileData = {
        name: name,
        uri: uri,
        type: mimeType,
        size: size,
      };

      console.log(fileData);

      let formData = new FormData();
      formData.append("resume", fileData);
      console.log(formData.get("resume"));

      const response = await fetch("http://127.0.0.1:5500/predict", {
        method: "POST",
        body: JSON.stringify(fileData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if the request was successful
      if (response.ok) {
        const responseData = await response.json();
        console.log("Server response:", responseData);
        setSearchTerm(responseData.recommendJobProfile);
        setShowUpload(true);
      } else {
        console.error(
          "Failed to upload resume. Server returned status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handelCancel = () => {
    setSearchTerm("");
    setShowUpload(false);
  };
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.userName}>Hello Adrian</Text>
        <Text style={styles.welcomeMessage}>Find your perfect job</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
            placeholder="What are you looking for?"
          />
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleClick}>
          <Image
            source={icons.search}
            resizeMode="contain"
            style={styles.searchBtnImage}
          />
        </TouchableOpacity>
      </View>
      {showUpload == false ? (
        <View style={styles.resumeUploadContainer}>
          <TouchableOpacity
            style={styles.resumeUploadButton}
            onPress={handleUploadResume}
          >
            <Text style={styles.msgText}>
              Select resume to receive personalized job recommendations
            </Text>
            <Image
              source={icons.plus}
              resizeMode="contain"
              style={styles.plusIcon}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: "row" , justifyContent:"center",}}>
          <View style={styles.resumeUploadbtn}>
            <TouchableOpacity onPress={handleClick}>
              <Text style={styles.uploadBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cancelBtn}>
            <TouchableOpacity onPress={handelCancel}>
              <Text style={styles.uploadBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.tabsContainer}>
        <FlatList
          data={jobTypes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tab(activeJobType, item)}
              onPress={() => {
                setActiveJobType(item);
                router.push(`/search/${item}`);
              }}
            >
              <Text style={styles.tabText(activeJobType, item)}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={{ columnGap: SIZES.small }}
          horizontal
        />
      </View>
    </View>
  );
};

export default Welcome;
