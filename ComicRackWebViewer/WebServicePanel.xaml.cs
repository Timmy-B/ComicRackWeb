using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Nancy.Hosting.Self;

namespace ComicRackWebViewer
{
    /// <summary>
    /// Interaction logic for WebServicePanel.xaml
    /// </summary>
    public partial class WebServicePanel : Window
    {
        private static ManualResetEvent mre = new ManualResetEvent(false);
        private static NancyHost host;
        private int? actualPort;
        private string address;


        public WebServicePanel()
        {
            InitializeComponent();
            addressTextBox.Text = Settings.GetSetting("externalip") ?? "localhost";
            portTextBox.Text = Settings.GetSetting("port") ?? "8080";
            //bindAll.IsChecked = bool.Parse(Settings.GetSetting("bindAll") ?? "false");
            SetEnabledState();
        }

        private void portTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (string.IsNullOrEmpty(portTextBox.Text))
            {
                return;
            }
            int x;
            if (int.TryParse(portTextBox.Text, out x))
            {
                actualPort = x;
            }
            else
            {
                actualPort = null;
            }
            SetEnabledState();
        }

        private void SetEnabledState()
        {
            if (startServiceButton == null)
            {
                return;
            }
            startServiceButton.IsEnabled = actualPort.HasValue && host == null;
            stopServiceButton.IsEnabled = host != null;
            portTextBox.IsEnabled = host == null;
            //if (!bindAll.IsChecked ?? false)
            {
                addressTextBox.IsEnabled = host == null;
            }
            if (host == null)
            {
                Status.Text = "Stopped";
            }
            else
            {
                Status.Text = "Running on: ";
                int port = actualPort.Value;
                List<Uri> uris = GetUriParams(port).ToList();
                foreach (var uri in uris)
                {
                    Status.Text += uri.ToString() + " ";
                }
            }
            Mouse.SetCursor(null);
        }

        public void StartService()
        {
            address = addressTextBox.Text;
            startServiceButton.IsEnabled = false;
            portTextBox.IsEnabled = false;
            addressTextBox.IsEnabled = false;
            Mouse.SetCursor(Cursors.Wait);
            //bool bind = bindAll.IsChecked ?? false;
            Task.Factory.StartNew(() => LoadService(true));
            Status.Text = "Starting";
        }

        public void LoadService(bool bindAll)
        {
            if (host != null)
            {
                StopService();
            }

            int port = actualPort.Value;
            
            
            host = new NancyHost(new Bootstrapper(), GetUriParams(port));
            //host = new NancyHost(new Bootstrapper(), GetUris(bindAll).ToArray());
            try
            {
                host.Start();
                this.Dispatcher.Invoke(new Action(SetEnabledState));
                mre.Reset();
                mre.WaitOne();

                host.Stop();
            }
            catch (Exception)
            {
                MessageBox.Show("Error in url binding");
                StopService();
                throw;
            }
            finally
            {
                host = null;
                this.Dispatcher.Invoke(new Action(SetEnabledState));
            }
        }

        private IEnumerable<Uri> GetUris(bool bindAll)
        {
            if (bindAll)
            {
                foreach (var ip in GetLocalIPs())
                {
                    string url = string.Format("http://{1}:{0}/", actualPort.Value, ip);
                    yield return new Uri(url);
                }
            }
            else
            {
                string url = string.Format("http://{1}:{0}/", actualPort.Value, address);
                yield return new Uri(url);
            }
        }

        private static IEnumerable<string> GetLocalIPs()
        {
            return Dns.GetHostAddresses(Dns.GetHostName()).Where(x => x.AddressFamily == AddressFamily.InterNetwork).Select(x => x.ToString());
        }

        private Uri[] GetUriParams(int port)
        {
            var uriParams = new List<Uri>();
            string hostName = Dns.GetHostName();

            // Host name URI
            string hostNameUri = string.Format("http://{0}:{1}", Dns.GetHostName(), port);
            uriParams.Add(new Uri(hostNameUri));

            if (address.Trim().Length > 0)
            {
              string external_address = string.Format("http://{0}:{1}/", address, port);
              uriParams.Add(new Uri(external_address));
            }
            

            // Host address URI(s)
            var hostEntry = Dns.GetHostEntry(hostName);
            foreach (var ipAddress in hostEntry.AddressList)
            {
                if (ipAddress.AddressFamily == AddressFamily.InterNetwork)  // IPv4 addresses only
                {
                    var addrBytes = ipAddress.GetAddressBytes();
                    string hostAddressUri = string.Format("http://{0}.{1}.{2}.{3}:{4}", addrBytes[0], addrBytes[1], addrBytes[2], addrBytes[3], port);
                    uriParams.Add(new Uri(hostAddressUri));
                }
            }



            // Localhost URI
            uriParams.Add(new Uri(string.Format("http://localhost:{0}", port)));
            return uriParams.ToArray();
        }
        
        public void StopService()
        {
            mre.Set();
        }

        private void startServiceButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (IsCurrentlyRunningAsAdmin())
            {
                Settings.SaveSetting("externalip", addressTextBox.Text);
                Settings.SaveSetting("port", portTextBox.Text);
                //Settings.SaveSetting("bindAll", (bindAll.IsChecked ?? false).ToString());
                StartService();
            }
            else
            {
                MessageBox.Show("Sorry!, you must be running ComicRack with administrator privileges.");
            }
        }

        private void stopServiceButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            StopService();
        }

        private bool IsCurrentlyRunningAsAdmin()
        {
            bool isAdmin = false;
            WindowsIdentity currentIdentity = WindowsIdentity.GetCurrent();
            if (currentIdentity != null)
            {
                WindowsPrincipal pricipal = new WindowsPrincipal(currentIdentity);
                isAdmin = pricipal.IsInRole(WindowsBuiltInRole.Administrator);
                pricipal = null;
            }
            return isAdmin;
        }

        private void CheckBox_Checked_1(object sender, RoutedEventArgs e)
        {
            IPAddress[] localIPs = Dns.GetHostAddresses(Dns.GetHostName());
            addressTextBox.IsEnabled = false;
        }

        private void bindAll_Unchecked_1(object sender, RoutedEventArgs e)
        {
            addressTextBox.IsEnabled = true;
        }
    }
}
