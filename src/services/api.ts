import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string | null) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  views: number;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

export interface AddNewTestData {
  title: string;
  pdfUrl: string;
  category: number | null;
  discipline: number | null;
  teacher: number | null;
}

async function getTestsByDiscipline(token: string, disciplineName: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    `/tests?groupBy=disciplines&disciplineName=${disciplineName}`,
    config
  );
}

async function getTestsByTeacher(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    "/tests?groupBy=teachers",
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function addNewTest(token: string, newTestData: AddNewTestData) {
  const config = getConfig(token);
  return baseAPI.post("/tests/add-new", newTestData, config);
}

async function updateViews(token: string | null, testId: number) {
  const config = getConfig(token);
  return baseAPI.put(`/tests/${testId}/update-views`, {}, config);
}

async function getTeacherByDiscipline(
  token: string | null,
  disciplineId: number
) {
  const config = getConfig(token);
  return baseAPI.get(`/teachers/disciplines/${disciplineId}`, config);
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  addNewTest,
  updateViews,
  getTeacherByDiscipline,
};

export default api;
