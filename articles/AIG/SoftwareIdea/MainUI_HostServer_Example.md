在基于 gRPC 进行 `HostServer`（硬件控制）和 `MainUI`（主控端）之间的联调设计中，应该遵循 **依赖抽象，而非具体实现** 的原则。这里，我们可以通过 **定义抽象接口 + gRPC 协议 + 依赖注入（DI）** 来实现 `MainUI` 对 `HostServer` 的调用，而 `HostServer` 通过 gRPC 向 `MainUI` 提供设备控制接口。

---

## **1. 系统设计：采用 gRPC 进行抽象封装**
### **组件划分**
- **HostServer（服务器端）**：
  - 直接控制相机、运动平台（Stage）、光源等硬件。
  - 提供 gRPC 服务，响应 `MainUI` 发送的指令。
- **MainUI（客户端）**：
  - 负责 UI 显示、控制任务流程。
  - 通过 gRPC 调用 `HostServer` 提供的服务（比如启动相机采集、控制 Stage 运动）。
- **公共抽象接口**：
  - 统一 gRPC 访问方式，使 `MainUI` 依赖 `IHostServerGrpcClient`（抽象接口），而不是 `HostServerGrpcClient`（具体实现）。

---

## **2. 设计抽象接口**
在 `MainUI` 侧，创建一个 `IHostServerGrpcClient` 作为抽象接口，供 UI 代码使用，而不直接依赖 gRPC 生成的 `HostServerGrpcClient`。

```csharp
public interface IHostServerGrpcClient
{
    Task<ImageData> CaptureImageAsync();
    Task<bool> MoveStageAsync(double x, double y);
}
```

其中：
- `CaptureImageAsync` 用于采集相机图像数据。
- `MoveStageAsync` 用于控制运动平台（Stage）移动。

这样，`MainUI` 只依赖 `IHostServerGrpcClient`，而具体实现 `GrpcHostServerClient` 负责与 `HostServer` 通信。

---

## **3. 定义 gRPC 的 proto 文件**
在 `proto` 文件中定义 gRPC 服务，包括相机数据采集和 Stage 运动控制。

```proto
syntax = "proto3";

package hostserver;

service HostServer {
    // 采集相机数据
    rpc CaptureImage (CaptureImageRequest) returns (CaptureImageResponse);
    
    // 控制Stage移动
    rpc MoveStage (MoveStageRequest) returns (MoveStageResponse);
}

message CaptureImageRequest {}

message CaptureImageResponse {
    bytes image_data = 1;  // 传输图像数据
}

message MoveStageRequest {
    double x = 1;
    double y = 2;
}

message MoveStageResponse {
    bool success = 1;
}
```

- `CaptureImage`：返回 `image_data`，表示采集的图像数据。
- `MoveStage`：接受 `x, y` 作为目标坐标，并返回 `success` 表示是否成功。

---

## **4. 在 `HostServer` 端实现 gRPC 服务**
`HostServer` 需要实现 `HostServer` gRPC 服务，并调用底层驱动控制相机和 Stage。

```csharp
public class HostServerService : HostServer.HostServerBase
{
    private readonly ICameraController _camera;
    private readonly IStageController _stage;

    public HostServerService(ICameraController camera, IStageController stage)
    {
        _camera = camera;
        _stage = stage;
    }

    public override async Task<CaptureImageResponse> CaptureImage(CaptureImageRequest request, ServerCallContext context)
    {
        byte[] imageData = await _camera.CaptureAsync();
        return new CaptureImageResponse { ImageData = Google.Protobuf.ByteString.CopyFrom(imageData) };
    }

    public override async Task<MoveStageResponse> MoveStage(MoveStageRequest request, ServerCallContext context)
    {
        bool success = await _stage.MoveAsync(request.X, request.Y);
        return new MoveStageResponse { Success = success };
    }
}
```

### 说明：
- `ICameraController` 和 `IStageController` 是 `HostServer` 的抽象层，避免直接依赖具体的相机 SDK 和 Stage 控制器。
- `CaptureImage` 通过 `ICameraController` 采集图像并返回二进制数据。
- `MoveStage` 通过 `IStageController` 控制运动平台。

#### **底层硬件抽象（`ICameraController` 和 `IStageController`）**
```csharp
public interface ICameraController
{
    Task<byte[]> CaptureAsync();
}

public interface IStageController
{
    Task<bool> MoveAsync(double x, double y);
}
```

然后 `HostServer` 可以实现这些接口：
```csharp
public class CameraController : ICameraController
{
    public async Task<byte[]> CaptureAsync()
    {
        // 调用相机 SDK 采集图像
        return await Task.FromResult(new byte[] { /* 模拟数据 */ });
    }
}

public class StageController : IStageController
{
    public async Task<bool> MoveAsync(double x, double y)
    {
        // 调用运动平台驱动执行移动
        return await Task.FromResult(true);
    }
}
```

这样，`HostServerService` **不依赖具体的相机 SDK 或运动控制器**，而是依赖 `ICameraController` 和 `IStageController`，符合 **依赖抽象而非具体实现** 的原则。

---

## **5. 在 `MainUI` 端实现 gRPC 客户端**
`MainUI` 需要实现 `IHostServerGrpcClient`，但不会直接使用 `HostServerGrpcClient`，而是封装到 `GrpcHostServerClient` 中。

```csharp
public class GrpcHostServerClient : IHostServerGrpcClient
{
    private readonly HostServer.HostServerClient _client;

    public GrpcHostServerClient(HostServer.HostServerClient client)
    {
        _client = client;
    }

    public async Task<ImageData> CaptureImageAsync()
    {
        var response = await _client.CaptureImageAsync(new CaptureImageRequest());
        return new ImageData { Data = response.ImageData.ToByteArray() };
    }

    public async Task<bool> MoveStageAsync(double x, double y)
    {
        var response = await _client.MoveStageAsync(new MoveStageRequest { X = x, Y = y });
        return response.Success;
    }
}
```

然后，**`MainUI` 依赖 `IHostServerGrpcClient` 而不是 `GrpcHostServerClient`**，符合**依赖倒置原则（DIP）**。

---

## **6. `MainUI` 通过依赖注入（DI）使用 gRPC 客户端**
在 `Startup.cs` 或 `Program.cs` 中配置依赖注入：

```csharp
services.AddGrpcClient<HostServer.HostServerClient>(o =>
{
    o.Address = new Uri("http://localhost:5000");
});

services.AddScoped<IHostServerGrpcClient, GrpcHostServerClient>();
```

这样，`MainUI` 在控制相机采集和 Stage 运动时，不需要关心 `GrpcHostServerClient` 的具体实现：

```csharp
public class MainController
{
    private readonly IHostServerGrpcClient _hostServer;

    public MainController(IHostServerGrpcClient hostServer)
    {
        _hostServer = hostServer;
    }

    public async Task CaptureAndMove()
    {
        var image = await _hostServer.CaptureImageAsync();
        Console.WriteLine("Captured image size: " + image.Data.Length);

        bool moved = await _hostServer.MoveStageAsync(100, 200);
        Console.WriteLine("Stage moved: " + moved);
    }
}
```

---

## **7. 总结**
✅ **`MainUI` 只依赖 `IHostServerGrpcClient`，而非 `GrpcHostServerClient`，符合依赖倒置原则（DIP）。**  
✅ **`HostServer` 通过 `ICameraController` 和 `IStageController` 实现硬件控制，解耦具体设备 SDK。**  
✅ **`MainUI` 和 `HostServer` 通过 gRPC 交互，支持分布式部署，提高扩展性和可维护性。**

这种设计使得 `MainUI` 和 `HostServer` 之间可以**自由扩展、单元测试、替换实现**，符合现代软件架构的最佳实践！🚀


# 进一步进行单元测试示例说明

在 `MainUI` 和 `HostServer` 之间进行 gRPC 通信时，单元测试的关键点是：  
1. **Mock 依赖接口**，如 `IHostServerGrpcClient`（`MainUI` 依赖它）和 `ICameraController`、`IStageController`（`HostServer` 依赖它们）。  
2. **使用 Moq 或 xUnit** 进行隔离测试，避免依赖真实 gRPC 服务或硬件。  
3. **模拟 gRPC 响应**，确保 `MainUI` 可以正确处理返回数据。  

---

# **1. 测试 `MainUI` 逻辑（Mock gRPC 客户端）**
`MainUI` 依赖 `IHostServerGrpcClient`，因此可以使用 `Moq` 来模拟它，测试 `MainController` 是否正确调用 `CaptureImageAsync` 和 `MoveStageAsync`。

### **📌 测试目标**
✅ `MainUI` 能够正确调用 `CaptureImageAsync` 获取图像数据。  
✅ `MainUI` 能够正确调用 `MoveStageAsync` 控制 Stage 移动。  
✅ `MainUI` 能够正确处理 `gRPC` 返回的不同情况。

---

## **📌 `MainUI` 的单元测试**
### **✅ 测试 `CaptureImageAsync` 和 `MoveStageAsync`**
```csharp
using System;
using System.Threading.Tasks;
using Moq;
using Xunit;

public class MainControllerTests
{
    private readonly Mock<IHostServerGrpcClient> _mockGrpcClient;
    private readonly MainController _controller;

    public MainControllerTests()
    {
        _mockGrpcClient = new Mock<IHostServerGrpcClient>();

        // 注入Mock的gRPC客户端
        _controller = new MainController(_mockGrpcClient.Object);
    }

    [Fact]
    public async Task CaptureImageAsync_ShouldReturnImageData()
    {
        // 模拟 gRPC 返回的图像数据
        var expectedImageData = new byte[] { 1, 2, 3, 4 };
        _mockGrpcClient.Setup(client => client.CaptureImageAsync())
                       .ReturnsAsync(new ImageData { Data = expectedImageData });

        // 调用方法
        var result = await _controller.CaptureAndMove();

        // 断言：检查是否正确获取图像数据
        Assert.NotNull(result);
        Assert.Equal(expectedImageData.Length, result.ImageSize);
    }

    [Fact]
    public async Task MoveStageAsync_ShouldReturnTrue_WhenMoveSuccessful()
    {
        // 模拟 Stage 移动成功
        _mockGrpcClient.Setup(client => client.MoveStageAsync(It.IsAny<double>(), It.IsAny<double>()))
                       .ReturnsAsync(true);

        // 调用方法
        var result = await _controller.CaptureAndMove();

        // 断言：检查 Stage 是否移动成功
        Assert.True(result.StageMoved);
    }

    [Fact]
    public async Task MoveStageAsync_ShouldReturnFalse_WhenMoveFails()
    {
        // 模拟 Stage 移动失败
        _mockGrpcClient.Setup(client => client.MoveStageAsync(It.IsAny<double>(), It.IsAny<double>()))
                       .ReturnsAsync(false);

        // 调用方法
        var result = await _controller.CaptureAndMove();

        // 断言：检查 Stage 失败处理
        Assert.False(result.StageMoved);
    }
}
```

### **🔍 代码解读**
1. **使用 `Mock<IHostServerGrpcClient>`** 模拟 `gRPC` 客户端，避免依赖真实服务。
2. **`_mockGrpcClient.Setup(...).ReturnsAsync(...)`** 用于模拟不同的 `gRPC` 返回值。
3. **`Assert.Equal()` 和 `Assert.True()`** 断言 `MainUI` 逻辑是否符合预期。

---

# **2. 测试 `HostServer` 逻辑（Mock 硬件控制）**
`HostServer` 依赖 `ICameraController` 和 `IStageController`，我们需要 Mock 它们来测试 `HostServerService` 是否能正确调用硬件。

### **📌 测试目标**
✅ `HostServer` 能够正确调用 `ICameraController` 采集图像并返回。  
✅ `HostServer` 能够正确调用 `IStageController` 控制 Stage 运动并返回结果。  
✅ `HostServer` 能够正确处理异常情况。

---

## **📌 `HostServer` 的单元测试**
```csharp
using System;
using System.Threading.Tasks;
using Grpc.Core;
using Moq;
using Xunit;

public class HostServerServiceTests
{
    private readonly Mock<ICameraController> _mockCamera;
    private readonly Mock<IStageController> _mockStage;
    private readonly HostServerService _service;

    public HostServerServiceTests()
    {
        _mockCamera = new Mock<ICameraController>();
        _mockStage = new Mock<IStageController>();

        // 注入Mock的硬件控制类
        _service = new HostServerService(_mockCamera.Object, _mockStage.Object);
    }

    [Fact]
    public async Task CaptureImage_ShouldReturnImageData()
    {
        // 模拟相机返回的图像数据
        var fakeImageData = new byte[] { 10, 20, 30, 40 };
        _mockCamera.Setup(cam => cam.CaptureAsync()).ReturnsAsync(fakeImageData);

        var response = await _service.CaptureImage(new CaptureImageRequest(), null);

        // 断言：返回的图像数据是否正确
        Assert.Equal(fakeImageData, response.ImageData.ToByteArray());
    }

    [Fact]
    public async Task MoveStage_ShouldReturnSuccess_WhenMoveIsSuccessful()
    {
        // 模拟 Stage 运动成功
        _mockStage.Setup(stage => stage.MoveAsync(It.IsAny<double>(), It.IsAny<double>()))
                  .ReturnsAsync(true);

        var response = await _service.MoveStage(new MoveStageRequest { X = 100, Y = 200 }, null);

        // 断言：检查 Stage 是否移动成功
        Assert.True(response.Success);
    }

    [Fact]
    public async Task MoveStage_ShouldReturnFailure_WhenMoveFails()
    {
        // 模拟 Stage 运动失败
        _mockStage.Setup(stage => stage.MoveAsync(It.IsAny<double>(), It.IsAny<double>()))
                  .ReturnsAsync(false);

        var response = await _service.MoveStage(new MoveStageRequest { X = 100, Y = 200 }, null);

        // 断言：检查 Stage 失败处理
        Assert.False(response.Success);
    }

    [Fact]
    public async Task CaptureImage_ShouldHandleExceptionGracefully()
    {
        // 模拟相机出现异常
        _mockCamera.Setup(cam => cam.CaptureAsync()).ThrowsAsync(new Exception("Camera error"));

        await Assert.ThrowsAsync<RpcException>(() => _service.CaptureImage(new CaptureImageRequest(), null));
    }
}
```

### **🔍 代码解读**
1. **使用 `Mock<ICameraController>` 和 `Mock<IStageController>`**，避免依赖真实硬件。
2. **`ReturnsAsync(fakeData)`** 模拟不同的返回值，测试 `HostServerService` 的处理逻辑。
3. **测试异常情况**：`CaptureImage_ShouldHandleExceptionGracefully` 断言 `HostServer` 在 `ICameraController` 发生异常时能正确抛出 `RpcException`。

---

## **3. 运行测试**
可以使用 `dotnet test` 运行所有单元测试：
```bash
dotnet test
```
或者在 Visual Studio 中使用 **Test Explorer** 运行测试。

---

## **4. 总结**
✅ **`MainUI` 使用 `Mock<IHostServerGrpcClient>` 进行单元测试，不依赖真实 gRPC 服务。**  
✅ **`HostServer` 使用 `Mock<ICameraController>` 和 `Mock<IStageController>` 进行单元测试，不依赖真实硬件。**  
✅ **覆盖正常和异常场景，确保系统在各种情况下都能稳定运行。**  

这样，我们就实现了 **高效的单元测试**，既能测试业务逻辑，又不依赖硬件和 gRPC 服务器，提高了测试速度和可维护性！🚀