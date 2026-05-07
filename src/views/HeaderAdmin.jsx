import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const logo = require("../../assets/images/logo.png");

export function HeaderAdmin({ menuAberto, toggleMenu, handleLogout }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Image source={logo} style={styles.logoImg} resizeMode="contain" />
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#FFF" />
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={{ position: "relative", zIndex: 999 }}>
          <TouchableOpacity style={styles.userInfo} onPress={toggleMenu}>
            <Ionicons name="person-circle-outline" size={30} color="#005F02" />
            <Text style={styles.userName}>Administrador</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#333" />
          </TouchableOpacity>

          {menuAberto && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
                <Text style={[styles.dropdownText, { color: "#D32F2F" }]}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    zIndex: 1000,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImg: {
    width: 120,
    height: 40,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  dropdownMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
