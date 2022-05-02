import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discipline, setDiscipline] = useState({
    name: "",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDiscipline({ ...discipline, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(
        token,
        discipline.name
      );
      const validTests = testsData.tests.filter(el => el.disciplines.length > 0)
      setTerms(validTests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token, discipline.name]);

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por disciplina"
        value={discipline.name}
        name="name"
        onChange={handleInputChange}
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} token={token} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
  token: string | null;
}

function TermsAccordions({ categories, terms, token }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px", marginBottom: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
              token={token}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
  token: string | null;
}

function DisciplinesAccordions({
  categories,
  disciplines,
  token,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse período...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
              token={token}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
  token: string | null;
}

function Categories({
  categories,
  teachersDisciplines,
  token,
}: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
              token={token}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
  token: string | null;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
  token,
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests
      categoryId={categoryId}
      testsWithTeachers={testsWithDisciplines}
      token={token}
    />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
  token: string | null;
}

function Tests({
  categoryId,
  token,
  testsWithTeachers: testsWithDisciplines,
}: TestsProps) {
  async function updateViews(testId: number) {
    await api.updateViews(token, testId);
  }
  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => (
            <Typography
              key={test.id}
              color="#878787"
              onClick={() => {
                updateViews(test.id);
              }}
            >
              <Link
                href={test.pdfUrl}
                target="_blank"
                underline="none"
                color="inherit"
              >{`${test.name} (${testsWithDisciplines.teacherName}) - ${
                test.views === 0
                  ? "nenhuma visualização"
                  : test.views > 1
                  ? `${test.views} visualizações`
                  : `${test.views} visualização`
              }`}</Link>
            </Typography>
          ))
      )}
    </>
  );
}

export default Disciplines;
