using System;
using System.IO;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Drawing;
using System.Windows.Forms;

namespace Newlead.Cencosud
{
    static class Program
    {
        private const string LocalUrl = "http://127.0.0.1:8501";
        private const string HealthUrl = "http://127.0.0.1:8501/_stcore/health";
        private const string CloudUrl = "https://recorridos-cencosud.streamlit.app";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Ventana Splash inmediata
            Form splash = new Form();
            splash.FormBorderStyle = FormBorderStyle.None;
            splash.StartPosition = FormStartPosition.CenterScreen;
            splash.Size = new Size(460, 160);
            splash.BackColor = Color.FromArgb(9, 35, 64); // Azul marino Newlead
            splash.ShowInTaskbar = true;
            splash.Text = "Newlead Cencosud";

            splash.Paint += delegate(object s, PaintEventArgs e)
            {
                using (Pen p = new Pen(Color.FromArgb(0, 119, 194), 2))
                {
                    e.Graphics.DrawRectangle(p, 1, 1, splash.Width - 2, splash.Height - 2);
                }
            };

            Label lblTitle = new Label();
            lblTitle.Text = "Newlead Contact Center";
            lblTitle.Font = new Font("Segoe UI", 13.5f, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(24, 22);
            lblTitle.AutoSize = true;
            splash.Controls.Add(lblTitle);

            Label lblSub = new Label();
            lblSub.Text = "Procesador Operacional de Recorridos Cencosud";
            lblSub.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSub.ForeColor = Color.FromArgb(210, 233, 246);
            lblSub.Location = new Point(24, 52);
            lblSub.AutoSize = true;
            splash.Controls.Add(lblSub);

            Label lblStatus = new Label();
            lblStatus.Text = "Verificando servicio operacional...";
            lblStatus.Font = new Font("Segoe UI", 9.5f, FontStyle.Italic);
            lblStatus.ForeColor = Color.FromArgb(0, 184, 98); // Verde Newlead
            lblStatus.Location = new Point(24, 96);
            lblStatus.AutoSize = true;
            splash.Controls.Add(lblStatus);

            splash.Show();
            Application.DoEvents();

            try
            {
                string targetUrl = LocalUrl;
                bool serverReady = IsHealthOk();

                if (!serverReady)
                {
                    lblStatus.Text = "Limpiando instancias previas...";
                    splash.Refresh();
                    Application.DoEvents();
                    KillDeadStreamlit();

                    string cencoDir = FindAppDirectory();
                    string pythonPath = FindPython();

                    if (!string.IsNullOrEmpty(cencoDir) && !string.IsNullOrEmpty(pythonPath))
                    {
                        lblStatus.Text = "Iniciando motor operacional...";
                        splash.Refresh();
                        Application.DoEvents();

                        string appPath = Path.Combine(cencoDir, "app.py");

                        ProcessStartInfo srv = new ProcessStartInfo();
                        srv.FileName = pythonPath;
                        srv.Arguments = "-m streamlit run \"" + appPath + "\" --server.port 8501 --server.address 127.0.0.1 --server.headless true --server.enableCORS false --server.enableXsrfProtection false --browser.serverAddress 127.0.0.1";
                        srv.WorkingDirectory = cencoDir;
                        srv.CreateNoWindow = true;
                        srv.UseShellExecute = false;
                        srv.WindowStyle = ProcessWindowStyle.Hidden;

                        // Asegurar PATH
                        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                        string pyBin = Path.Combine(localAppData, @"Python\bin");
                        string existingPath = Environment.GetEnvironmentVariable("PATH") ?? "";
                        if (!existingPath.Contains(pyBin))
                        {
                            srv.EnvironmentVariables["PATH"] = pyBin + ";" + existingPath;
                        }

                        Process.Start(srv);

                        int waitCount = 0;
                        int maxRetries = 40; // hasta 14 segundos
                        while (waitCount++ < maxRetries && !IsHealthOk())
                        {
                            Thread.Sleep(350);
                            lblStatus.Text = string.Format("Cargando componentes ({0}s)...", (waitCount * 350) / 1000);
                            splash.Refresh();
                            Application.DoEvents();
                        }

                        if (IsHealthOk())
                        {
                            targetUrl = LocalUrl;
                        }
                        else
                        {
                            targetUrl = CloudUrl;
                        }
                    }
                    else
                    {
                        targetUrl = CloudUrl;
                    }
                }

                lblStatus.Text = "Abriendo ventana de aplicación...";
                splash.Refresh();
                Application.DoEvents();

                bool launchedAppWindow = false;
                string browser = FindBrowser();
                if (!string.IsNullOrEmpty(browser))
                {
                    try
                    {
                        ProcessStartInfo bPsi = new ProcessStartInfo();
                        bPsi.FileName = browser;
                        bPsi.Arguments = string.Format("--app=\"{0}\" --window-size=1360,900", targetUrl);
                        bPsi.UseShellExecute = false;
                        Process.Start(bPsi);
                        launchedAppWindow = true;
                    }
                    catch { }
                }

                if (!launchedAppWindow)
                {
                    ProcessStartInfo defPsi = new ProcessStartInfo(targetUrl);
                    defPsi.UseShellExecute = true;
                    Process.Start(defPsi);
                }

                Thread.Sleep(400);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error al iniciar Newlead Cencosud:\n\n" + ex.Message,
                    "Newlead Contact Center",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
            finally
            {
                splash.Close();
                splash.Dispose();
            }
        }

        static bool IsHealthOk()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(HealthUrl);
                req.Timeout = 800;
                req.Method = "GET";
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    if (resp.StatusCode == HttpStatusCode.OK)
                    {
                        using (StreamReader r = new StreamReader(resp.GetResponseStream()))
                        {
                            string t = r.ReadToEnd();
                            return t.Trim().ToLower().Contains("ok");
                        }
                    }
                }
            }
            catch { }
            return false;
        }

        static void KillDeadStreamlit()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "taskkill.exe";
                psi.Arguments = "/F /FI \"WINDOWTITLE eq *streamlit*\"";
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process p = Process.Start(psi);
                if (p != null) p.WaitForExit(1000);
            }
            catch { }
        }

        static string FindAppDirectory()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;

            // 1. En la carpeta raíz del proyecto
            if (File.Exists(Path.Combine(baseDir, "app.py")) && File.Exists(Path.Combine(baseDir, "processor.py")))
            {
                return baseDir;
            }

            // 2. En Recorrido_Cencosud
            string subCenco = Path.Combine(baseDir, "Recorrido_Cencosud");
            if (Directory.Exists(subCenco) && File.Exists(Path.Combine(subCenco, "app.py")))
            {
                return subCenco;
            }

            // 3. Ruta fija principal
            string fixedPath = @"C:\Users\Alejandro\Proyectos Antigravity\Recorridos";
            if (Directory.Exists(fixedPath) && File.Exists(Path.Combine(fixedPath, "app.py")))
            {
                return fixedPath;
            }

            return null;
        }

        static string FindPython()
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string p1 = Path.Combine(localAppData, @"Python\bin\python.exe");
            if (File.Exists(p1)) return p1;

            string p2 = Path.Combine(localAppData, @"Programs\Python\Python312\python.exe");
            if (File.Exists(p2)) return p2;

            string p3 = Path.Combine(localAppData, @"Programs\Python\Python311\python.exe");
            if (File.Exists(p3)) return p3;

            string p4 = Path.Combine(localAppData, @"Programs\Python\Python310\python.exe");
            if (File.Exists(p4)) return p4;

            string pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (!string.IsNullOrEmpty(pathEnv))
            {
                foreach (string dir in pathEnv.Split(';'))
                {
                    string candidate = Path.Combine(dir.Trim(), "python.exe");
                    if (File.Exists(candidate) && !candidate.ToLower().Contains("windowsapps"))
                    {
                        return candidate;
                    }
                }
            }
            return null;
        }

        static string FindBrowser()
        {
            string[] possiblePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (!string.IsNullOrEmpty(path) && File.Exists(path))
                {
                    return path;
                }
            }

            return null;
        }
    }
}