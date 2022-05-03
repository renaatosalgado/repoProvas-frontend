import {
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
  TestByDiscipline,
} from "../services/api";

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

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token, "");
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
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
            variant="outlined"
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
          <Button
            variant="contained"
            onClick={() => navigate("/app/adicionar")}
          >
            Adicionar
          </Button>
        </Box>
        <NewTestForm categories={categories} terms={terms} />
      </Box>
    </>
  );
}

interface NewTestFormProps {
  categories: Category[];
  terms: TestByDiscipline[];
}

function NewTestForm({ categories, terms }: NewTestFormProps) {
  const [formData, setFormData] = useState<AddNewTestData>({
    title: "",
    pdfUrl: "",
    category: null,
    discipline: null,
    teacher: null,
  });
  const { setMessage } = useAlert();
  const { token } = useAuth();
  const [teacherOptions, setTeacherOptions] = useState<any[]>([]);
  const rawTeacherOptions: any[] = [];
  const rawDisciplines: any[] = getOnlyRawDisciplines();
  const nagivate = useNavigate();

  function getOnlyRawDisciplines() {
    const rawDisciplines: any[] = [];

    terms.map((term) =>
      term.disciplines.map((discipline) => rawDisciplines.push(discipline))
    );
    return rawDisciplines;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    api
      .getTeacherByDiscipline(token, formData.discipline as number)
      .then((res) => {
        res.data.teachers.forEach((el: { teacher: { name: any } }) =>
          rawTeacherOptions.push(el.teacher)
        );
      })
      .finally(() => {
        setTeacherOptions(rawTeacherOptions);
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (
      !formData?.title ||
      !formData?.pdfUrl ||
      !formData?.discipline ||
      !formData?.teacher ||
      !formData?.category
    ) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }

    try {
      console.log(formData)
      await api.addNewTest(token as string, formData);
      nagivate("/app/disciplinas");
    } catch (error: Error | AxiosError | any) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data,
        });
        nagivate("/app/adicionar");
        return;
      }

      setMessage({
        type: "error",
        text: "Erro, tente novamente em alguns segundos!",
      });
      nagivate("/app/adicionar");
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
          name="pdfUrl"
          sx={styles.input}
          label="PDF da Prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.pdfUrl}
        />

        <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Disciplina"
          name="discipline"
          value={formData.discipline}
          onChange={handleInputChange}
        >
          {rawDisciplines.map((discipline) => (
            <MenuItem key={discipline.id} value={discipline.id}>
              {discipline.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Categoria"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          sx={{ width: "100%", marginBottom: "16px" }}
          select
          label="Pessoa Instrutora"
          name="teacher"
          value={formData.teacher}
          onChange={handleInputChange}
        >
          {teacherOptions.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.id}>
              {teacher.name}
            </MenuItem>
          ))}
        </TextField>

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
