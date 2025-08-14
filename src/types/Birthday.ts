export interface Birthday {
  id: string;
  name: string;
  dateOfBirth: string;
  age: {
    years: number;
    months: number;
    days: number;
  };
  nextBirthday: {
    date: string;
    daysUntil: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayInput {
  name: string;
  dateOfBirth: string;
}
