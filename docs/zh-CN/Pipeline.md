# Pipeline 管道原理

LiteRT/Redis 的客户端实现中，Pipeline 有两种使用方式：**事务**和**管线**。

## 1. 事务

事务是指通过 `WATCH` 和 `MULTI` 指令配合实现的原子操作，其实现完全基于 Redis 服务器。

```
Application               Client                      Server
     |                       |                           |
     |  Send MULIT command   |    Send MULIT command     |
     |---------------------->|-------------------------->|
     |                       |                           |
     |       Reply OK        |         Reply OK          |
     |<----------------------|<--------------------------|
     |                       |                           |
     |   Send SET command    |     Send SET command      |
     |---------------------->|-------------------------->|
     |                       |                           |
     |      Reply QUEUED     |         Reply QUEUED      |
     |<----------------------|<--------------------------|
     |                       |                           |
     |   Send GET command    |     Send GET command      |
     |---------------------->|-------------------------->|
     |                       |                           |
     |      Reply QUEUED     |         Reply QUEUED      |
     |<----------------------|<--------------------------|
     |                       |                           |
     |   Send EXEC command   |     Send EXEC command     |
     |---------------------->|-------------------------->|  Server execute
     |                       |                           |  all queued commands。
     |                       |                           |
     | Reply list of result  |   Reply list of result    |
     |<----------------------|<--------------------------|
     |                       |                           |
   Over                    over                         over
```

## 2. 管道

管道是指将一系列命令缓存在本地，然后一次性发出去，由于 Redis 的单线程模型，这些命令会连续不间断地（不会被其他连接发送的命令插队）执行。

```
Application               Client                      Server
     |                       |                           |
     |   Send SET command    |                           |
     |---------------------->|                           |
     |                       |                           |
     |      Reply QUEUED     |                           |
     |<----------------------|                           |
     |                       |                           |
     |   Send GET command    |                           |
     |---------------------->|                           |
     |                       |                           |
     |      Reply QUEUED     |                           |
     |<----------------------|                           |
     |                       |                           |
     |   Send EXEC command   | Send all queued command   |
     |---------------------->|-------------------------->|  Server execute
     |                       |                           |  all the series of
     |                       |                           |  commands
     |                       |                           |
     | Reply list of result  |   Reply list of result    |
     |<----------------------|<--------------------------|
     |                       |                           |
   Over                    over                         over
```

