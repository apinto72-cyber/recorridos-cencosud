using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;

namespace Newlead.Mapfre
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string localIndex = Path.Combine(baseDir, "index.html");
                string indexPath;

                if (File.Exists(localIndex))
                {
                    indexPath = localIndex;
                }
                else
                {
                    string appDir = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "NewleadMapfre"
                    );
                    string vendorDir = Path.Combine(appDir, "vendor");
                    if (!Directory.Exists(vendorDir))
                    {
                        Directory.CreateDirectory(vendorDir);
                    }

                    Assembly assembly = Assembly.GetExecutingAssembly();
                    ExtractResource(assembly, "index.html", Path.Combine(appDir, "index.html"));
                    ExtractResource(assembly, "styles.css", Path.Combine(appDir, "styles.css"));
                    ExtractResource(assembly, "app.js", Path.Combine(appDir, "app.js"));
                    ExtractResource(assembly, "logo_newlead.png", Path.Combine(appDir, "logo_newlead.png"));
                    ExtractResource(assembly, "xlsx.full.min.js", Path.Combine(vendorDir, "xlsx.full.min.js"));
                    ExtractResource(assembly, "jszip.min.js", Path.Combine(vendorDir, "jszip.min.js"));

                    indexPath = Path.Combine(appDir, "index.html");
                }

                string fileUri = "file:///" + indexPath.Replace('\\', '/');
                string browserPath = FindBrowser();

                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1260,860", fileUri);
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                }
                else
                {
                    ProcessStartInfo psi = new ProcessStartInfo(indexPath);
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "No fue posible iniciar la aplicación Newlead Mapfre:\n\n" + ex.Message,
                    "Newlead Contact Center",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        static void ExtractResource(Assembly assembly, string resourceName, string targetPath)
        {
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null) return;

                bool needWrite = true;
                if (File.Exists(targetPath))
                {
                    FileInfo fi = new FileInfo(targetPath);
                    if (fi.Length == stream.Length)
                    {
                        needWrite = false;
                    }
                }

                if (needWrite)
                {
                    using (FileStream fs = new FileStream(targetPath, FileMode.Create, FileAccess.Write))
                    {
                        byte[] buffer = new byte[16384];
                        int bytesRead;
                        while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
                        {
                            fs.Write(buffer, 0, bytesRead);
                        }
                    }
                }
            }
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
