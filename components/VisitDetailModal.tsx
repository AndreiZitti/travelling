"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocationById, type Location } from "@/lib/locations";
import type { Visit, VisitInput, PlaceVisited, VisitDate } from "@/lib/types";
import PhotoUploader from "./PhotoUploader";

interface VisitDetailModalProps {
  locationId: string;
  visit?: Visit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationId: string, updates: VisitInput) => void;
  onDelete?: (locationId: string) => void;
  userId?: string;
}

export default function VisitDetailModal({
  locationId,
  visit,
  isOpen,
  onClose,
  onSave,
  onDelete,
  userId,
}: VisitDetailModalProps) {
  const location = getLocationById(locationId);

  // Form state
  const [rating, setRating] = useState<number | undefined>(visit?.rating);
  const [notes, setNotes] = useState(visit?.notes || "");
  const [visitDates, setVisitDates] = useState<VisitDate[]>(visit?.visitDates || []);
  const [placesVisited, setPlacesVisited] = useState<PlaceVisited[]>(visit?.placesVisited || []);
  const [photos, setPhotos] = useState<string[]>(visit?.photos || []);
  const [newPlace, setNewPlace] = useState("");
  const [newPlaceType, setNewPlaceType] = useState<PlaceVisited["type"]>("city");
  const [newDateStart, setNewDateStart] = useState("");
  const [newDateEnd, setNewDateEnd] = useState("");

  // Reset form when modal opens with different location
  useEffect(() => {
    if (isOpen) {
      setRating(visit?.rating);
      setNotes(visit?.notes || "");
      setVisitDates(visit?.visitDates || []);
      setPlacesVisited(visit?.placesVisited || []);
      setPhotos(visit?.photos || []);
      setNewPlace("");
      setNewDateStart("");
      setNewDateEnd("");
    }
  }, [isOpen, visit, locationId]);

  const handleSave = () => {
    onSave(locationId, {
      locationId,
      rating,
      notes: notes || undefined,
      visitDates,
      placesVisited,
      photos,
    });
    onClose();
  };

  const handleAddPlace = () => {
    if (newPlace.trim()) {
      setPlacesVisited([...placesVisited, { name: newPlace.trim(), type: newPlaceType }]);
      setNewPlace("");
    }
  };

  const handleRemovePlace = (index: number) => {
    setPlacesVisited(placesVisited.filter((_, i) => i !== index));
  };

  const handleAddDate = () => {
    if (newDateStart) {
      setVisitDates([...visitDates, {
        startDate: newDateStart,
        endDate: newDateEnd || undefined,
      }]);
      setNewDateStart("");
      setNewDateEnd("");
    }
  };

  const handleRemoveDate = (index: number) => {
    setVisitDates(visitDates.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to remove ${location?.name} from your visits?`)) {
      onDelete(locationId);
      onClose();
    }
  };

  if (!location) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 grid grid-rows-[auto_1fr_auto] overflow-hidden"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{location.name}</h2>
                <p className="text-sm text-slate-500">
                  {location.type === "territory" && location.parentId && (
                    <span>Territory of {getLocationById(location.parentId)?.name} - </span>
                  )}
                  {location.type === "state" && (
                    <span>US State - </span>
                  )}
                  {location.continent}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div
              className="p-4 space-y-6 overflow-y-auto min-h-0"
            >
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How did you like it?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(rating === star ? undefined : star)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                        rating && star <= rating
                          ? "bg-yellow-100 text-yellow-500"
                          : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {rating && star <= rating ? "\u2605" : "\u2606"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you do? Any highlights or memories..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Visit Dates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  When did you visit?
                </label>

                {/* Existing dates */}
                {visitDates.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {visitDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-600">
                          {new Date(date.startDate).toLocaleDateString()}
                          {date.endDate && ` - ${new Date(date.endDate).toLocaleDateString()}`}
                        </span>
                        <button
                          onClick={() => handleRemoveDate(index)}
                          className="ml-auto text-slate-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new date */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">From</label>
                    <input
                      type="date"
                      value={newDateStart}
                      onChange={(e) => setNewDateStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">To (optional)</label>
                    <input
                      type="date"
                      value={newDateEnd}
                      onChange={(e) => setNewDateEnd(e.target.value)}
                      min={newDateStart}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleAddDate}
                    disabled={!newDateStart}
                    className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Places Visited */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Places you visited
                </label>

                {/* Existing places */}
                {placesVisited.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {placesVisited.map((place, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700"
                      >
                        <span className="text-xs text-slate-400">
                          {place.type === "city" && "\uD83C\uDFD9\uFE0F"}
                          {place.type === "landmark" && "\uD83C\uDFDB\uFE0F"}
                          {place.type === "region" && "\uD83C\uDF04"}
                          {place.type === "other" && "\uD83D\uDCCD"}
                        </span>
                        {place.name}
                        <button
                          onClick={() => handleRemovePlace(index)}
                          className="ml-1 text-slate-400 hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add new place */}
                <div className="flex gap-2">
                  <select
                    value={newPlaceType}
                    onChange={(e) => setNewPlaceType(e.target.value as PlaceVisited["type"])}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="city">City</option>
                    <option value="landmark">Landmark</option>
                    <option value="region">Region</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPlace()}
                    placeholder="e.g., Paris, Eiffel Tower..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddPlace}
                    disabled={!newPlace.trim()}
                    className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Photos
                </label>
                {userId ? (
                  <PhotoUploader
                    photos={photos}
                    userId={userId}
                    locationId={locationId}
                    onPhotosChange={setPhotos}
                  />
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-400">Sign in to upload photos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 flex gap-3">
              {visit && onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
