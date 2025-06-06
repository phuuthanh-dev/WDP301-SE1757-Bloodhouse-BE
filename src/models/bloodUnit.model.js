"use strict";
const mongoose = require("mongoose");
const { BLOOD_UNIT_STATUS, TEST_BLOOD_UNIT_RESULT } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodUnit";
const COLLECTION_NAME = "BloodUnits";

const bloodUnitSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    donationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BloodDonation",
      required: true 
    },
    facilityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Facility",
      required: true 
    },
    bloodGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup",
      required: true
    },
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodComponent",
      required: true,
    },
    quantity: { 
      type: Number,
      required: true 
    },
    remainingQuantity: {
      type: Number,
      required: true,
    },
    deliveredQuantity: {
      type: Number,
      default: 0,
    },
    collectedAt: {
      type: Date,
      required: true 
    },
    expiresAt: { 
      type: Date,
      required: true 
    },
    status: {
      type: String,
      enum: Object.values(BLOOD_UNIT_STATUS),
      default: BLOOD_UNIT_STATUS.TESTING,
    },
    testResults: {
      hiv: { type: String, enum: Object.values(TEST_BLOOD_UNIT_RESULT), default: TEST_BLOOD_UNIT_RESULT.PENDING },
      hepatitisB: { type: String, enum: Object.values(TEST_BLOOD_UNIT_RESULT), default: TEST_BLOOD_UNIT_RESULT.PENDING },
      hepatitisC: { type: String, enum: Object.values(TEST_BLOOD_UNIT_RESULT), default: TEST_BLOOD_UNIT_RESULT.PENDING },
      syphilis: { type: String, enum: Object.values(TEST_BLOOD_UNIT_RESULT), default: TEST_BLOOD_UNIT_RESULT.PENDING },
      notes: { type: String }
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff"
    },
    processedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff"
    },
    approvedAt: { type: Date }
  },
  { 
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, 
    collection: COLLECTION_NAME 
  }
);

// Pre-save middleware to generate unique code
bloodUnitSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Generate unique code if new document
    if (!this.code) {
      try {
        this.code = await generateUniqueCodeSafe(
          mongoose.model(DOCUMENT_NAME),
          "BUNT", // Blood UNiT
          "code"
        );
      } catch (error) {
        return next(error);
      }
    }
    // Initialize remainingQuantity to match quantity for new units
    if (!this.remainingQuantity) {
      this.remainingQuantity = this.quantity;

    }
  }
  next();
});

// Indexes
bloodUnitSchema.index({ donationId: 1 });
bloodUnitSchema.index({ facilityId: 1 });
bloodUnitSchema.index({ status: 1 });
bloodUnitSchema.index({ expiresAt: 1 });
bloodUnitSchema.index({ bloodRequestId: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, bloodUnitSchema);