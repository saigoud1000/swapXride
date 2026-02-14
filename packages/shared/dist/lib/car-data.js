"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CASH_DIRECTIONS = exports.TITLE_STATUSES = exports.CONDITIONS = exports.YEARS = exports.CAR_MAKES = void 0;
exports.CAR_MAKES = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick", "Cadillac", "Chevrolet",
    "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar",
    "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren",
    "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla",
    "Toyota", "Volkswagen", "Volvo"
].sort();
exports.YEARS = Array.from({ length: new Date().getFullYear() - 1990 + 2 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());
exports.CONDITIONS = ["Excellent", "Good", "Fair", "Project"];
exports.TITLE_STATUSES = ["Clean", "Rebuilt", "Salvage", "Lien", "Missing"];
exports.CASH_DIRECTIONS = [
    { value: "offering", label: "I can add cash" },
    { value: "asking", label: "I want cash" },
    { value: "none", label: "Straight trade" }
];
