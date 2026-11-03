using System;
using System.IO;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace Newlead.Recorridos
{
    static class Program
    {
        private const string LocalUrl = "http://localhost:8501";
        private const string CloudUrl = "https://recorridos-cencosud.streamlit.app";

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string appPyPath = Path.Combine(baseDir, "app.py");

                bool serverRunning = IsServerAlive(LocalUrl);
                string targetUrl = LocalUrl;

                if (!serverRunning)
                {
                    string pythonPath = FindPython();
                    if (File.Exists(appPyPath) && !string.IsNullOrEmpty(pythonPath))
                    {
                        ProcessStartInfo srvInfo = new ProcessStartInfo();
                        srvInfo.FileName = pythonPath;
                        srvInfo.Arguments = "-m streamlit run \"" + appPyPath + "\" --server.port 8501 --server.headless true --browser.serverAddress localhost";
                        srvInfo.WorkingDirectory = baseDir;
                        srvInfo.CreateNoWindow = true;
                        srvInfo.UseShellExecute = false;
                        srvInfo.WindowStyle = ProcessWindowStyle.Hidden;

                        Process.Start(srvInfo);

                        int retries = 20;
                        while (retries-- > 0 && !IsServerAlive(LocalUrl))
                        {
                            Thread.Sleep(500);
                        }
                    }
                    else
                    {
                        targetUrl = CloudUrl;
                    }
                }

                string browserPath = FindBrowser();
                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1360,900", targetUrl);
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(targetUrl);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error al iniciar la aplicación Newlead Recorridos:\n\n" + ex.Message,
                    "Newlead Contact Center",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        static bool IsServerAlive(string url)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.Timeout = 1200;
                request.Method = "HEAD";
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