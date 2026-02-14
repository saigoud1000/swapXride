export const CAR_MAKES = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick", "Cadillac", "Chevrolet",
    "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar",
    "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren",
    "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla",
    "Toyota", "Volkswagen", "Volvo"
].sort();

export const YEARS = Array.from(
    { length: new Date().getFullYear() - 1990 + 2 },

    (_, i) => (new Date().getFullYear() + 1 - i).toString()
);

export const CONDITIONS = ["Excellent", "Good", "Fair", "Project"]
export const TITLE_STATUSES = ["Clean", "Rebuilt", "Salvage", "Lien", "Missing"]
export const CASH_DIRECTIONS = [
    { value: "offering", label: "I can add cash" },
    { value: "asking", label: "I want cash" },
    { value: "none", label: "Straight trade" }
]
