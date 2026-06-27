"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onShipmentDelete = exports.onShipmentStatusUpdate = exports.logActivity = void 0;
const activityLogger_1 = require("./activityLogger");
Object.defineProperty(exports, "logActivity", { enumerable: true, get: function () { return activityLogger_1.logActivity; } });
const shipmentTriggers_1 = require("./shipmentTriggers");
Object.defineProperty(exports, "onShipmentStatusUpdate", { enumerable: true, get: function () { return shipmentTriggers_1.onShipmentStatusUpdate; } });
Object.defineProperty(exports, "onShipmentDelete", { enumerable: true, get: function () { return shipmentTriggers_1.onShipmentDelete; } });
//# sourceMappingURL=index.js.map