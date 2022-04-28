import {
  Autocomplete,
  Box,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
//eslint-disable-next-line
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import { MainApp } from "../components/MainApp";
import useAuth from "../hooks/useAuth";
import useAlert from "../hooks/useAlert";
import api, {
  AddNewTestData,
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
  TestByTeacher,
} from "../services/api";
import { matches } from "lodash";

const styles = {
  input: { marginBottom: "16px", width: "100%" },
  actionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  form: {
    width: "700px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

function AddNewTest() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [teachers, setTeachers] = useState<TestByTeacher[]>([]);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: teachersData } = await api.getTestsByTeacher(token);
      setTeachers(teachersData.tests);
    }
    loadPage();
  }, [token]);

  return (
    <>
      <MainApp />

      <Typography
        sx={{ marginBottom: "25px", textAlign: "center" }}
        variant="h5"
        component="h1"
      >
        Adicione uma prova
      </Typography>

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
        <NewTestForm
          categories={categories}
          terms={terms}
          teachers={teachers}
        />
      </Box>
    </>
  );
}

interface NewTestFormProps {
  categories: Category[];
  terms: TestByDiscipline[];
  teachers: TestByTeacher[];
}

function NewTestForm({ categories, terms, teachers }: NewTestFormProps) {
  const [formData, setFormData] = useState<AddNewTestData>({
    title: "",
    pdf: "",
    category: "",
    discipline: "",
    teacher: "",
  });
  const { setMessage } = useAlert();
  const { token } = useAuth();
  const [matchingTeachers, setMatchingTeachers] = useState<TestByTeacher[]>([]);

  const rawDisciplines: any[] = getOnlyRawDisciplines();

  //getMatchingTeachers();

  function getOnlyRawDisciplines() {
    const rawDisciplines: any[] = [];

    terms.map((term) =>
      term.disciplines.map((discipline) => rawDisciplines.push(discipline))
    );
    return rawDisciplines;
  }

  // function getMatchingTeachers() {
  //   if (formData.discipline) {
  //     const matches = teachers.filter(
  //       (el) => el.discipline.name === formData.discipline
  //     );

  //     setMatchingTeachers(matches);
  //     console.log(matches);
  //   }
  // }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (
      !formData?.title ||
      !formData?.pdf ||
      !formData?.discipline ||
      !formData?.teacher ||
      !formData?.category
    ) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }

    try {
      await api.addNewTest(token as string, formData);
    } catch (error: Error | AxiosError | any) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data,
        });
        return;
      }

      setMessage({
        type: "error",
        text: "Erro, tente novamente em alguns segundos!",
      });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Divider sx={{ marginBottom: "35px" }} />

      <Box sx={styles.form}>
        <TextField
          name="title"
          sx={styles.input}
          label="Título da Prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.title}
        />

        <TextField
          name="pdf"
          sx={styles.input}
          label="PDF da Prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.pdf}
        />

        <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Categoria"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Disciplina"
          name="discipline"
          value={formData.discipline}
          onChange={handleInputChange}
        >
          {rawDisciplines.map((discipline) => (
            <MenuItem key={discipline.id} value={discipline.name}>
              {discipline.name}
            </MenuItem>
          ))}
        </TextField>

        {/* <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Pessoa Instrutora"
          name="teacher"
          value={formData.teacher}
          onChange={handleInputChange}
        >
          {matchingTeachers.map((teacher) => (
            <MenuItem key={teacher.teacher.id} value={teacher.teacher.name}>
              {teacher.teacher.name}
            </MenuItem>
          ))}
        </TextField> */}
        {/* <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={matchingTeachers}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie" />}
        /> */}
        <Button
          variant="contained"
          type="submit"
          sx={{ width: "100%", marginTop: "12px" }}
        >
          ENVIAR
        </Button>
      </Box>
    </Form>
  );
}

export default AddNewTest;
