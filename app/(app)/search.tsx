import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "../../src/shared/components/ui/AppHeader";

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color="#007AFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} fiszek</Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultIcon}>
          <Ionicons
            name={item.type === "deck" ? "library" : "card"}
            size={20}
            color="#007AFF"
          />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultDescription}>{item.description}</Text>
          {item.author && (
            <View style={styles.resultMeta}>
              <Text style={styles.resultAuthor}>od {item.author}</Text>
              {item.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color="#FF9500" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Szukaj" showAddButton={false} />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj fiszek, kolekcji..."
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
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
                    <Ionicons name="search-outline" size={48} color="#C7C7CC" />
                    <Text style={styles.emptyText}>
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
            <Text style={styles.sectionTitle}>Popularne kolekcje</Text>
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

            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>Polecane dla Ciebie</Text>
              <Text style={styles.comingSoon}>
                Personalizowane rekomendacje będą wkrótce dostępne
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 8,
  },
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "#8E8E93",
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
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
    color: "#1a1a1a",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultAuthor: {
    fontSize: 12,
    color: "#8E8E93",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 2,
  },
  emptyResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 12,
  },
  featuredSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
  },
  comingSoon: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
