import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/siswa";

const emptyForm = {
  kode_siswa: "",
  nama_siswa: "",
  alamat_siswa: "",
  tgl_siswa: "",
  jurusan_siswa: "",
};

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCode, setEditingCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Data siswa gagal dimuat. Pastikan backend dan database berjalan."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingCode("");
  }

  function startEditing(student) {
    setEditingCode(student.kode_siswa);
    setForm({
      kode_siswa: student.kode_siswa,
      nama_siswa: student.nama_siswa,
      alamat_siswa: student.alamat_siswa,
      tgl_siswa: student.tgl_siswa,
      jurusan_siswa: student.jurusan_siswa,
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingCode) {
        const student = {
          nama_siswa: form.nama_siswa,
          alamat_siswa: form.alamat_siswa,
          tgl_siswa: form.tgl_siswa,
          jurusan_siswa: form.jurusan_siswa,
        };
        await axios.put(
          `${API_URL}/${encodeURIComponent(editingCode)}`,
          student
        );
        setNotice("Data siswa berhasil diperbarui.");
      } else {
        await axios.post(API_URL, form);
        setNotice("Data siswa berhasil ditambahkan.");
      }
      resetForm();
      await loadStudents();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Data siswa gagal disimpan."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(code) {
    if (!window.confirm(`Hapus data siswa dengan kode ${code}?`)) {
      return;
    }

    setError("");
    setNotice("");
    try {
      await axios.delete(`${API_URL}/${encodeURIComponent(code)}`);
      setNotice("Data siswa berhasil dihapus.");
      await loadStudents();
      if (editingCode === code) {
        resetForm();
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Data siswa gagal dihapus."));
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">ADMINISTRASI SEKOLAH</p>
          <h1>Data Siswa</h1>
          <p className="page-description">
            Kelola informasi siswa dalam satu tempat.
          </p>
        </div>
        <div className="student-count" aria-label={`${students.length} siswa`}>
          <span className="count-number">{students.length}</span>
          <span className="count-label">Siswa terdaftar</span>
        </div>
      </header>

      {error && (
        <div className="feedback feedback-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="feedback feedback-success" role="status">
          {notice}
        </div>
      )}

      <section className="panel form-panel" aria-labelledby="form-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FORMULIR</p>
            <h2 id="form-title">
              {editingCode ? "Edit data siswa" : "Tambah siswa"}
            </h2>
          </div>
          {editingCode && (
            <button
              className="button button-quiet"
              onClick={resetForm}
              type="button"
            >
              Batal edit
            </button>
          )}
        </div>

        <form className="student-form" onSubmit={handleSubmit}>
          <label>
            Kode siswa
            <input
              autoComplete="off"
              maxLength={30}
              name="kode_siswa"
              onChange={handleChange}
              placeholder="Contoh: SIS-001"
              required
              value={form.kode_siswa}
              disabled={Boolean(editingCode)}
            />
          </label>
          <label>
            Nama siswa
            <input
              maxLength={120}
              name="nama_siswa"
              onChange={handleChange}
              placeholder="Nama lengkap"
              required
              value={form.nama_siswa}
            />
          </label>
          <label className="field-wide">
            Alamat siswa
            <textarea
              name="alamat_siswa"
              onChange={handleChange}
              placeholder="Alamat lengkap"
              required
              rows={3}
              value={form.alamat_siswa}
            />
          </label>
          <label>
            Tanggal lahir
            <input
              name="tgl_siswa"
              onChange={handleChange}
              required
              type="date"
              value={form.tgl_siswa}
            />
          </label>
          <label>
            Jurusan siswa
            <input
              maxLength={120}
              name="jurusan_siswa"
              onChange={handleChange}
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              required
              value={form.jurusan_siswa}
            />
          </label>
          <div className="form-actions field-wide">
            <button className="button button-primary" disabled={saving}>
              {saving
                ? "Menyimpan..."
                : editingCode
                  ? "Simpan perubahan"
                  : "Tambah siswa"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel table-panel" aria-labelledby="list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DAFTAR</p>
            <h2 id="list-title">Semua siswa</h2>
          </div>
          <button
            className="button button-quiet"
            disabled={loading}
            onClick={loadStudents}
            type="button"
          >
            {loading ? "Memuat..." : "Muat ulang"}
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Nama</th>
                <th scope="col">Alamat</th>
                <th scope="col">Tanggal lahir</th>
                <th scope="col">Jurusan</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.kode_siswa}>
                  <td className="code-cell">{student.kode_siswa}</td>
                  <td className="name-cell">{student.nama_siswa}</td>
                  <td>{student.alamat_siswa}</td>
                  <td>{student.tgl_siswa}</td>
                  <td>{student.jurusan_siswa}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="button button-small button-quiet"
                        onClick={() => startEditing(student)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-small button-danger"
                        onClick={() => handleDelete(student.kode_siswa)}
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && students.length === 0 && (
                <tr>
                  <td className="empty-state" colSpan={6}>
                    Belum ada data siswa. Tambahkan siswa melalui formulir di
                    atas.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="empty-state" colSpan={6}>
                    Memuat data siswa...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer className="page-footer">Manajemen Data Siswa</footer>
    </main>
  );
}

export default App;