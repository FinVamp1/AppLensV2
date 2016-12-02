using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Web;

namespace AppLensV2
{
    public sealed class GeoRegionClient
    {
        private const string GeoRegionEndpoint = "https://askambojgr.cloudapp.net:1743/";

        public static async Task<dynamic> GetResource(string apiRoute)
        {
            if (apiRoute == null)
            {
                throw new ArgumentNullException("apiRoute");
            }

            WebRequestHandler handler = new WebRequestHandler();
            X509Certificate2 certificate = GetMyX509Certificate();
            handler.ClientCertificates.Add(certificate);
            handler.ServerCertificateValidationCallback +=
                (sender, cert, chain, sslPolicyErrors) => true;

            using (var client = new HttpClient(handler))
            {
                client.Timeout = TimeSpan.FromSeconds(60);
                client.MaxResponseContentBufferSize = Int32.MaxValue;
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Add("internal-applens", "true");

                var response = await client.GetAsync(GeoRegionEndpoint + apiRoute);
                
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsAsync<dynamic>();
                }

                return response.StatusCode;
            }
        }

        private static X509Certificate2 GetMyX509Certificate()
        {
            X509Store certStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            X509Certificate2 cert = null;

            certStore.Open(OpenFlags.ReadOnly);

            try
            {
                //D8D2125683F7169186DEE9469F0070F1C4302311
                //1241D6C92881FF9BB075BF3C01B19CE41B383C9D
                X509Certificate2Collection certCollection = certStore.Certificates.Find(
                                       X509FindType.FindByThumbprint,
                                       "D8D2125683F7169186DEE9469F0070F1C4302311",
                                       false);
                // Get the first cert with the thumbprint
                if (certCollection.Count > 0)
                {
                    cert = certCollection[0];
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                certStore.Close();
            }

            return cert;
        }
    }
}