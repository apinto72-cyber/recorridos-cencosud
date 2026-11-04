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
        private const string LocalUrl = "http://localhost:8501";
        private const string CloudUrl = "https://recorridos-cencosud.streamlit.app";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Crear ventana Splash elegante de carga inmediata
            Form splash = new Form();
            splash.FormBorderStyle = FormBorderStyle.None;
            splash.StartPosition = FormStartPosition.CenterScreen;
            splash.Size = new Size(440, 150);
            splash.BackColor = Color.FromArgb(9, 35, 64);
            splash.ShowInTaskbar = true;
            splash.Text = "Newlead Cencosud";

            // Borde sutil
            splash.Paint += delegate(object s, PaintEventArgs e)
            {
                using (Pen p = new Pen(Color.FromArgb(0, 119, 194), 2))
                {
                    e.Graphics.DrawRectangle(p, 1, 1, splash.Width - 2, splash.Height - 2);
                }
            };

            Label lblTitle = new Label();
            lblTitle.Text = "Newlead Contact Center";
            lblTitle.Font = new Font("Segoe UI", 13, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(24, 24);
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
            lblStatus.Text = "Iniciando servicio...";
            lblStatus.Font = new Font("Segoe UI", 9f, FontStyle.Italic);
            lblStatus.ForeColor = Color.FromArgb(0, 184, 98);
            lblStatus.Location = new Point(24, 94);
            lblStatus.AutoSize = true;
            splash.Controls.Add(lblStatus);

            splash.Show();
            Application.DoEvents();

            try
            {
                string cencoDir = FindCencosudDirectory();
                string appPyPath = !string.IsNullOrEmpty(cencoDir) ? Path.Combine(cencoDir, "app.py") : null;

                bool serverRunning = IsServerAlive(LocalUrl);
                string targetUrl = LocalUrl;

                if (!serverRunning)
                {
                    string pythonPath = FindPython();
                    if (!string.IsNullOrEmpty(appPyPath) && File.Exists(appPyPath) && !string.IsNullOrEmpty(pythonPath))
                    {
                        lblStatus.Text = "Iniciando motor local de procesamiento...";
                        splash.Refresh();
                        Application.DoEvents();

                        ProcessStartInfo srvInfo = new ProcessStartInfo();
                        srvInfo.FileName = pythonPath;
                        srvInfo.Arguments = "-m streamlit run \"" + appPyPath + "\" --server.port 8501 --server.headless true --browser.serverAddress localhost";
                        srvInfo.WorkingDirectory = cencoDir;
                        srvInfo.CreateNoWindow = true;
                        srvInfo.UseShellExecute = false;
                        srvInfo.WindowStyle = ProcessWindowStyle.Hidden;

                        // Asegurar que el PATH contenga Python\bin
                        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                        string pyBin = Path.Combine(localAppData, @"Python\bin");
                        string existingPath = Environment.GetEnvironmentVariable("PATH") ?? "";
                        if (!existingPath.Contains(pyBin))
                        {
                            srvInfo.EnvironmentVariables["PATH"] = pyBin + ";" + existingPath;
                        }

                        Process.Start(srvInfo);

                        // Esperar a que el servidor responda
                        int retries = 25;
                        while (retries-- > 0 && !IsServerAlive(LocalUrl))
                        {
                            Thread.Sleep(400);
                            Application.DoEvents();
                        }

                        if (!IsServerAlive(LocalUrl))
                        {
                            targetUrl = CloudUrl;
                        }
                    }
                    else
                    {
                        targetUrl = CloudUrl;
                    }
                }

                lblStatus.Text = "Abriendo aplicación...";
                splash.Refresh();
                Application.DoEvents();

                // Intentar abrir en modo ventana independiente (App mode de Edge o Chrome)
                bool opened = false;
                string browserPath = FindBrowser();
                if (!string.IsNullOrEmpty(browserPath))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = browserPath;
                        psi.Arguments = string.Format("--app=\"{0}\" --window-size=1360,900", targetUrl);
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                        opened = true;
                    }
                    catch { }
                }

                if (!opened)
                {
                    ProcessStartInfo defPsi = new ProcessStartInfo(targetUrl);
                    defPsi.UseShellExecute = true;
                    Process.Start(defPsi);
                }

                Thread.Sleep(500);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error al iniciar la aplicación Newlead Cencosud:\n\n" + ex.Message,
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

        static bool IsServerAlive(string url)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.Timeout = 900;
                request.Method = "GET";
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        static string FindCencosudDirectory()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;

            // 1. En la misma carpeta
            if (File.Exists(Path.Combine(baseDir, "app.py")) && File.Exists(Path.Combine(baseDir, "processor.py")))
            {
                return baseDir;
            }

            // 2. En subcarpeta Recorrido_Cencosud
            string subDir = Path.Combine(baseDir, "Recorrido_Cencosud");
            if (Directory.Exists(subDir) && File.Exists(Path.Combine(subDir, "app.py")))
            {
                return subDir;
            }

            // 3. Ruta fija del proyecto
            string fixedDir = @"C:\Users\Alejandro\Proyectos Antigravity\Recorridos\Recorrido_Cencosud";
            if (Directory.Exists(fixedDir) && File.Exists(Path.Combine(fixedDir, "app.py")))
            {
                return fixedDir;
            }

            return null;
        }

        static string FindPython()
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string localPython = Path.Combine(localAppData, @"Python\bin\python.exe");
            if (File.Exists(localPython)) return localPython;

            string localPy2 = Path.Combine(localAppData, @"Programs\Python\Python312\python.exe");
            if (File.Exists(localPy2)) return localPy2;

            string localPy3 = Path.Combine(localAppData, @"Programs\Python\Python311\python.exe");
            if (File.Exists(localPy3)) return localPy3;

            string localPy4 = Path.Combine(localAppData, @"Programs\Python\Python310\python.exe");
            if (File.Exists(localPy4)) return localPy4;

            string pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (!string.IsNullOrEmpty(pathEnv))
            {
                string[] dirs = pathEnv.Split(';');
                foreach (string dir in dirs)
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