import { AppHeader } from "@/components/ui";
import { ThemedSurface } from "@/theme/ThemedSurface";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface SearchResult {
  id: string;
  title: string;
  type: "deck" | "flashcard";
  description: string;
  author?: string;
  rating?: number;
}

// eslint-disable-next-line max-lines-per-function
export default function SearchScreen() {
  const { colors, mode } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const GRID_HPAD = 16; // categoriesContainer horizontal padding
  const GRID_GAP = 12; // space between two columns
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = Math.floor((screenWidth - GRID_HPAD * 2 - GRID_GAP) / 2);

  // Popular categories/collections
  const categories: SearchCategory[] = [
    { id: "1", name: "1000 słówek angielskich", icon: "language", count: 1000 },
    { id: "2", name: "Phrasal Verbs", icon: "text", count: 250 },
    { id: "3", name: "Business English", icon: "briefcase", count: 500 },
    { id: "4", name: "TOEFL Vocabulary", icon: "school", count: 800 },
    { id: "5", name: "Angielski IT", icon: "desktop", count: 300 },
    { id: "6", name: "Medical English", icon: "medical", count: 400 },
  ];

  // Mock search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate search with timeout
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Advanced English Vocabulary",
          type: "deck" as const,
          description: "Zaawansowane słownictwo angielskie dla poziomów B2-C2",
          author: "EduLang",
          rating: 4.5,
        },
        {
          id: "2",
          title: "Programming Terms",
          type: "deck" as const,
          description: "Terminologia programistyczna w języku angielskim",
          author: "TechEng",
          rating: 4.8,
        },
        {
          id: "3",
          title: "Travel Phrases",
          type: "deck" as const,
          description: "Przydatne zwroty podczas podróży",
          author: "Wanderer",
          rating: 4.3,
        },
      ].filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleCategoryPress = (category: SearchCategory) => {
    setSearchQuery(category.name);
    handleSearch(category.name);
  };

  const handleResultPress = (result: SearchResult) => {
    console.log("Selected:", result.title);
    // TODO: Navigate to deck details or add to library
  };

  const renderCategory = ({ item }: { item: SearchCategory }) => (
    <TouchableOpacity onPress={() => handleCategoryPress(item)}>
      <ThemedSurface style={[styles.categoryCard, { width: cardWidth }]}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: mode === "dark" ? colors.background : "#E3F2FD",
            },
          ]}
        >
          <Ionicons name={item.icon as any} size={24} color={colors.primary} />
        </View>
        <Text
          style={[styles.categoryName, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text style={[styles.categoryCount, { color: colors.mutedText }]}>
          {item.count} fiszek
        </Text>
      </ThemedSurface>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <ThemedSurface style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor:
                  mode === "dark" ? colors.background : "#E3F2FD",
              },
            ]}
          >
            <Ionicons
              name={item.type === "deck" ? "library" : "card"}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text
              style={[styles.resultDescription, { color: colors.mutedText }]}
            >
              {item.description}
            </Text>
            {item.author && (
              <View style={styles.resultMeta}>
                <Text
                  style={[styles.resultAuthor, { color: colors.mutedText }]}
                >
                  od {item.author}
                </Text>
                {item.rating && (
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#FF9500" />
                    <Text
                      style={[styles.ratingText, { color: colors.mutedText }]}
                    >
                      {item.rating}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ThemedSurface>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Szukaj" showAddButton={false} />

      <View style={styles.content}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor:
                  mode === "dark" ? colors.background : "#f0f0f0",
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.mutedText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Szukaj fiszek, kolekcji..."
              placeholderTextColor={colors.mutedText}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.mutedText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isSearching ? "Szukam..." : `Wyniki dla "${searchQuery}"`}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !isSearching ? (
                  <View style={styles.emptyResults}>
                    <Ionicons
                      name="search-outline"
                      size={48}
                      color={colors.mutedText}
                    />
                    <Text
                      style={[styles.emptyText, { color: colors.mutedText }]}
                    >
                      Brak wyników dla "{searchQuery}"
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        ) : (
          /* Popular Categories */
          <ScrollView
            style={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Popularne kolekcje
            </Text>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View style={styles.categorySeparator} />
              )}
              columnWrapperStyle={styles.categoryRow}
            />

            <ThemedSurface style={styles.featuredSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Polecane dla Ciebie
              </Text>
              <Text style={[styles.comingSoon, { color: colors.mutedText }]}>
                Personalizowane rekomendacje będą wkrótce dostępne
              </Text>
            </ThemedSurface>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 140,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categorySeparator: {
    height: 12,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultAuthor: {
    fontSize: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
  },
  emptyResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  featuredSection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  comingSoon: {
    fontSize: 14,
    textAlign: "center",
  },
});
