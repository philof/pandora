using System.Collections.Generic;
using Pandora.Definitions.Interfaces;

namespace Pandora.Definitions.ResourceManager.PowerBIDedicated.v2021_01_01.AutoScaleVCores
{
    internal class Definition : ApiDefinition
    {
        // Generated from Swagger revision "865f0857a8785640f9bca0ab9842d29be589f2a8" 

        public string ApiVersion => "2021-01-01";
        public string Name => "AutoScaleVCores";
        public IEnumerable<Interfaces.ApiOperation> Operations => new List<Interfaces.ApiOperation>
        {
            new CreateOperation(),
            new DeleteOperation(),
            new GetOperation(),
            new ListByResourceGroupOperation(),
            new ListBySubscriptionOperation(),
            new UpdateOperation(),
        };
    }
}
