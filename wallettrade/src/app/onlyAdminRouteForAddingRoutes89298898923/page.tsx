"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@bot/components/ui/button";
import { Input } from "@bot/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@bot/components/ui/card";
import { Badge } from "@bot/components/ui/badge";
import { Plus, Search, MoreVertical, Trash2, X } from "lucide-react";

import { Token } from "@bot/lib/tokens";

// Add this style block at the beginning of the component, right after the imports
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
  }
`;

// Add this right after the component declaration
export default function AdminTokens() {
  // Add the style injection
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Add token form state
  const [formData, setFormData] = useState({
    chainId: 56,
    decimals: "",
    symbol: "",
    name: "",
    isNative: false,
    address: "",
    logoURI: "",
    usdtPrice: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingToken, setEditingToken] = useState<Token | null>(null);

  const [editFormData, setEditFormData] = useState({
    chainId: 56,
    decimals: "",
    symbol: "",
    name: "",
    isNative: false,
    address: "",
    logoURI: "",
    usdtPrice: "",
  });

  // Fetch tokens on component mount
  useEffect(() => {
    fetchTokens();
  }, []);

  // Filter tokens based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTokens(tokens);
    } else {
      const filtered = tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, tokens]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dexTokens`
      );
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dexTokens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            decimals: Number.parseInt(formData.decimals),
          }),
        }
      );

      if (response.ok) {
        await fetchTokens();
        setShowAddModal(false);
        setFormData({
          chainId: 56,
          decimals: "",
          symbol: "",
          name: "",
          isNative: false,
          address: "",
          logoURI: "",
          usdtPrice: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Error adding token");
      }
    } catch (error) {
      console.error("Error adding token:", error);
      alert("Error adding token");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = async (symbol: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dexTokens`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol }),
        }
      );

      if (response.ok) {
        await fetchTokens();
        setShowDeleteMenu(null);
      } else {
        const error = await response.json();
        alert(error.message || "Error deleting token");
      }
    } catch (error) {
      console.error("Error deleting token:", error);
      alert("Error deleting token");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingToken) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/dexTokens/${editingToken.symbol}`,
        {
          method: "Patch",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editFormData,
            decimals: Number.parseInt(editFormData.decimals),
          }),
        }
      );

      if (response.ok) {
        await fetchTokens();
        setShowEditModal(false);
        setEditingToken(null);
        setEditFormData({
          chainId: 56,
          decimals: "",
          symbol: "",
          name: "",
          isNative: false,
          address: "",
          logoURI: "",
          usdtPrice: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Error updating token");
      }
    } catch (error) {
      console.error("Error updating token:", error);
      alert("Error updating token");
    } finally {
      setLoading(false);
    }
  };
  const openEditModal = (token: Token) => {
    setEditingToken(token);
    setEditFormData({
      chainId: token.chainId,
      decimals: token.decimals.toString(),
      symbol: token.symbol,
      name: token.name,
      isNative: token.isNative || false,
      address: token.address || "",
      logoURI: token.logoURI || "",
      usdtPrice: (token as any).usdtPrice || "",
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            Token Management
          </h1>
          <p className="text-gray-400">
            Manage DEX tokens and their configurations
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Add Token Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-black hover:bg-yellow-500 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Token
          </Button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white pl-10"
            />
          </div>
        </div>

        {/* Token List */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Tokens ({filteredTokens.length})
              {loading && (
                <span className="text-sm text-gray-400 ml-2">Loading...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchQuery
                  ? "No tokens found matching your search"
                  : "No tokens available"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Token Icon */}
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI || "/placeholder.svg"}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {token.symbol.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Token Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {token.symbol}
                          </span>
                          {token.isNative && (
                            <Badge
                              variant="outline"
                              className="border-yellow-400 text-yellow-400 text-xs"
                            >
                              Native
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {token.name}
                        </div>
                        {token.address && (
                          <div className="text-xs text-gray-500 font-mono">
                            {token.address.slice(0, 6)}...
                            {token.address.slice(-4)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Token Details */}
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-400">
                          Chain ID: {token.chainId}
                        </div>
                        <div className="text-gray-400">
                          Decimals: {token.decimals}
                        </div>
                      </div>

                      {/* Menu Button */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowDeleteMenu(
                              showDeleteMenu === token.symbol
                                ? null
                                : token.symbol
                            )
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {/* Delete Menu */}
                        {showDeleteMenu === token.symbol && (
                          <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                openEditModal(token);
                                setShowDeleteMenu(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:bg-gray-700 rounded-lg w-full text-left"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteToken(token.symbol)}
                              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] border border-gray-700 flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">
                Add New Token
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <form onSubmit={handleAddToken} className="p-6 space-y-4">
                {/* Chain ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chain ID
                  </label>
                  <Input
                    type="number"
                    value={formData.chainId}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        chainId: Number.parseInt(e.target.value) || 56,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.symbol}
                    onChange={(e: any) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e: any) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* usdtPrice */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    USDT <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.usdtPrice}
                    onChange={(e: any) =>
                      setFormData({ ...formData, usdtPrice: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                {/* Decimals */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decimals <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.decimals}
                    onChange={(e: any) =>
                      setFormData({ ...formData, decimals: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Is Native */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNative"
                    checked={formData.isNative}
                    onChange={(e) =>
                      setFormData({ ...formData, isNative: e.target.checked })
                    }
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                  />
                  <label
                    htmlFor="isNative"
                    className="text-sm font-medium text-gray-300"
                  >
                    Is Native Token
                  </label>
                </div>

                {/* Address (only if not native) */}
                {!formData.isNative && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contract Address <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e: any) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      required={!formData.isNative}
                    />
                  </div>
                )}

                {/* Logo URI */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Logo URI (optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.logoURI}
                    onChange={(e: any) =>
                      setFormData({ ...formData, logoURI: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {loading ? "Adding..." : "Add Token"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Token Modal */}
      {showEditModal && editingToken && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] border border-gray-700 flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">Edit Token</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <form onSubmit={handleEditToken} className="p-6 space-y-4">
                {/* Chain ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chain ID
                  </label>
                  <Input
                    type="number"
                    value={editFormData.chainId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        chainId: Number.parseInt(e.target.value) || 56,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.symbol}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        symbol: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Decimals */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decimals <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    value={editFormData.decimals}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        decimals: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                {/* USDT Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    USDT Price
                  </label>
                  <Input
                    type="text"
                    value={editFormData.usdtPrice}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        usdtPrice: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* Is Native */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsNative"
                    checked={editFormData.isNative}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isNative: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                  />
                  <label
                    htmlFor="editIsNative"
                    className="text-sm font-medium text-gray-300"
                  >
                    Is Native Token
                  </label>
                </div>

                {/* Address (only if not native) */}
                {!editFormData.isNative && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contract Address <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      required={!editFormData.isNative}
                    />
                  </div>
                )}

                {/* Logo URI */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Logo URI (optional)
                  </label>
                  <Input
                    type="url"
                    value={editFormData.logoURI}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        logoURI: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {loading ? "Updating..." : "Update Token"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Click outside to close delete menu */}
      {showDeleteMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDeleteMenu(null)}
        />
      )}
    </div>
  );
}
