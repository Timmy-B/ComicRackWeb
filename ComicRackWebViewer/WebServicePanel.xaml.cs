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


using BCR;


namespace ComicRackWebViewer
{
    /// <summary>
    /// Interaction logic for WebServicePanel.xaml
    /// </summary>
    public partial class WebServicePanel : Window
    {
        private static ManualResetEvent mre = new ManualResetEvent(false);
        private static BCR.WebHost host;
        private int? actualPort;
        private bool allowExternal;


        public WebServicePanel()
        {
            InitializeComponent();
            portTextBox.Text = BCRSettingsStore.Instance.webserver_port.ToString();
            actualPort = BCRSettingsStore.Instance.webserver_port;
            allowExternal = BCRSettingsStore.Instance.webserver_allow_external;

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
                
                if (allowExternal)
                {
                  Status.Text += string.Format("http://+:{0}/", port);
                }
            }
            Mouse.SetCursor(null);
        }

        public void StartService()
        {
            startServiceButton.IsEnabled = false;
            portTextBox.IsEnabled = false;
            Mouse.SetCursor(Cursors.Wait);
            Task.Factory.StartNew(() => LoadService());
            Status.Text = "Starting";
        }

        public void LoadService()
        {
            if (host != null)
            {
                StopService();
            }

            int port = actualPort.Value;
            
            
            host = new WebHost(new Bootstrapper(), allowExternal, port, GetUriParams(port));

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


        private static IEnumerable<string> GetLocalIPs()
        {
            return Dns.GetHostAddresses(Dns.GetHostName()).Where(x => x.AddressFamily == AddressFamily.InterNetwork).Select(x => x.ToString());
        }

        private Uri[] GetUriParams(int port)
        {
            var uriParams = new List<Uri>();
            
            // No need to enumerate addresses, as the httplistener will respond to all requests regardless of host name.
            if (allowExternal)
              return uriParams.ToArray();
            
            // Enumerate all local addresses.
            string hostName = Dns.GetHostName();

            // Host name URI
            string hostNameUri = string.Format("http://{0}:{1}", Dns.GetHostName(), port);
            uriParams.Add(new Uri(hostNameUri));

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
                BCRSettingsStore.Instance.webserver_port = actualPort.HasValue ? actualPort.Value : 8080;
                BCRSettingsStore.Instance.Save();

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

    
        private void button1_Click(object sender, RoutedEventArgs e)
        {
          var cursor = this.Cursor; 
          this.Cursor = Cursors.Wait;
          
          BCRSettingsStore.Instance.ClearPageCache();
          
          this.Cursor = cursor;
        }
    }
}
