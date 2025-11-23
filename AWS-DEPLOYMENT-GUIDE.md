# AWS Elastic Beanstalk Deployment - Quick Checklist

**⏱️ Estimated Time:** 15-20 minutes  
**💰 Cost:** Free tier eligible (first 12 months)

This is a streamlined checklist for deploying your Spring Boot + React application to AWS Elastic Beanstalk with RDS PostgreSQL.

## ✅ Pre-Deployment Checklist

**Status:** Ready to Deploy!

✅ Docker image built and pushed to Docker Hub:
- Image: `joseeneassilva/springboot-react-fullstack:v2`
- Command used: `./mvnw clean package -P bundle-backend-and-frontend -P jib-build-docker-image-and-push-it-to-docker-hub -Dapp.image.tag=v2`

✅ File ready: `elasticbeanstalk/docker-compose.yaml` (uses AWS environment variables)

---

## 📋 Step-by-Step Deployment

### Step 1: Create Application & Environment

**Navigate to:** AWS Console → Elastic Beanstalk → **Create Application**

**Copy these settings exactly:**

```
Application name: fullstack-syscomz
Environment name: Fullstack-syscomz-env

Platform: Docker
Platform branch: Docker running on 64bit Amazon Linux 2023
Platform version: (use recommended/latest)

Application code: Upload your code
  → Upload file: elasticbeanstalk/docker-compose.yaml
  → Version label: v2
```

---

### Step 2: Configure More Options

Click **"Configure more options"** button

#### Database Configuration
Click **Edit** on the Database card and enter:

```
Engine: postgres
Engine version: 17.2 (or latest available)
Instance class: db.t3.micro
Storage: 20 GB
Username: postgres
Password: [CREATE STRONG PASSWORD]
Database name: ebdb
Retention: Delete (or Create snapshot for backup)
```

**💾 SAVE YOUR PASSWORD:**
```
Username: postgres
Password: _________________ (write it down!)
```

#### Capacity Configuration
Click **Edit** on the Capacity card:

```
Environment type: Single instance (for development/testing)
Instance types: t2.micro (or t3.micro - both free tier)
```

#### Other Settings
✅ Leave as default - AWS handles:
- VPC and networking
- Security groups (EB ↔ RDS connectivity)
- Monitoring
- Auto-updates

---

### Step 3: Create Environment

Click **"Create environment"** button

⏱️ **Time:** 10-15 minutes

**AWS is now:**
1. ✓ Creating VPC resources
2. ✓ Launching EC2 instance (t2.micro)
3. ✓ Creating RDS PostgreSQL database (db.t3.micro)
4. ✓ Setting up security groups
5. ✓ Pulling Docker image: `joseeneassilva/springboot-react-fullstack:v2`
6. ✓ Starting container with AWS environment variables
7. ✓ Running health checks

---

## 👀 Monitor Deployment Progress

### Watch the Events Tab

**Expected Events (in order):**

```
✓ Creating security groups...
✓ Creating EC2 instance...
✓ Created EIP: [IP address]
✓ Creating RDS database...
✓ Waiting for EC2 instances to launch...
✓ Waiting for database to become available...
✓ Instance deployment completed successfully
✓ Environment health has transitioned to Ok
✓ Successfully launched environment: Fullstack-syscomz-env
```

### Health Status Guide:
- 🔴 **Red/Severe:** Error - check logs immediately
- 🟡 **Yellow/Warning:** Still deploying or minor issues (normal during setup)
- 🟢 **Green/Ok:** ✅ SUCCESS! Ready to use

**Wait for:** **Health: Ok (Green)** ✅

---

## 🌐 Get Your Application URL

Once environment shows **Green/Ok**, your URL is:

**Format:** `http://<environment-name>.<random-id>.<region>.elasticbeanstalk.com`

**Example:**
```
http://fullstack-syscomz-env.eba-ejvsqiqk.us-east-1.elasticbeanstalk.com
```

📋 **Save this URL!**

---

## ✅ Verify Deployment Works

### Test 1: Health Check
```bash
curl http://YOUR-EB-URL.elasticbeanstalk.com/actuator/health
```

**Expected:**
```json
{"status":"UP"}
```

### Test 2: API Endpoint
```bash
curl http://YOUR-EB-URL.elasticbeanstalk.com/api/v1/students
```

**Expected:** JSON array `[]` or with data

### Test 3: Frontend in Browser
Open: `http://YOUR-EB-URL.elasticbeanstalk.com`

**Expected:** React app loads, you can add students

---

## 📊 Database Information

**Automatic Environment Variables (AWS manages these):**

Your `docker-compose.yaml` uses these AWS-provided variables:
- `${RDS_HOSTNAME}` - Database endpoint
- `${RDS_PORT}` - Port 5432
- `${RDS_DB_NAME}` - Database name (ebdb)
- `${RDS_USERNAME}` - Your username (postgres)
- `${RDS_PASSWORD}` - Your password

**To view RDS details:**
Configuration → Database section (read-only)

**Connection String (for reference):**
```
jdbc:postgresql://<RDS_HOSTNAME>:5432/ebdb
```

---

## 🔄 Update/Redeploy Your Application

When you make code changes:

**1. Build new version:**
```bash
./mvnw clean package \
  -P bundle-backend-and-frontend \
  -P jib-build-docker-image-and-push-it-to-docker-hub \
  -Dapp.image.tag=v3
```

**2. Update docker-compose.yaml:**
```yaml
# Change from:
image: "joseeneassilva/springboot-react-fullstack:v2"
# To:
image: "joseeneassilva/springboot-react-fullstack:v3"
```

**3. Deploy in AWS:**
- Environment → Upload and deploy
- Upload: `elasticbeanstalk/docker-compose.yaml`
- Version: v3
- Deploy

⏱️ **Time:** 2-5 minutes for update

---

## 🚨 Troubleshooting

### If Health is Red/Severe:

**1. Check Logs:**
```
Environment → Logs → Request Logs → Last 100 Lines
```

**2. Common Issues:**

| Issue | Solution |
|-------|----------|
| Can't pull Docker image | Verify image exists: https://hub.docker.com/r/joseeneassilva/springboot-react-fullstack |
| Database connection failed | Wait 2-3 more minutes (RDS takes time to start) |
| Container won't start | Check logs for Java/Spring Boot errors |
| Port mapping wrong | Verify docker-compose: `ports: - "80:8080"` |

**3. Check Environment Variables:**
Configuration → Software → Edit  
Verify: `SPRING_PROFILES_ACTIVE: dev`

### If Status is "No Data":

- Normal for first 1-2 minutes after deployment
- If persists >5 minutes, check logs

---

## 💰 Cost Management

### Free Tier (First 12 Months):
- ✅ EC2 t2.micro: 750 hours/month
- ✅ RDS db.t3.micro: 750 hours/month  
- ✅ 20GB storage included

### To Minimize Costs:

**When done testing - Terminate:**
```
Configuration → Environment Actions → Terminate Environment
```

**Options:**
- **Delete database:** ✅ No charges, data lost
- **Create snapshot:** Database preserved, can restore later (~$0.10/GB/month)

⏱️ **Termination time:** 10-20 minutes

### To Restore Later:
1. Create new EB environment
2. Skip database step
3. Restore RDS from snapshot
4. Update connection details

---

## 📝 Quick Reference

### Your Configuration:
```
Docker Hub: joseeneassilva/springboot-react-fullstack
Current Version: v2
Region: us-east-1
Platform: Docker on Amazon Linux 2023
Instance: t2.micro
Database: PostgreSQL 17.2 on db.t3.micro
Spring Profile: dev
Environment: Single instance
```

### Key Files:
- Docker compose: `elasticbeanstalk/docker-compose.yaml`
- Spring config: `src/main/resources/application-dev.properties`

### Build Command:
```bash
./mvnw clean package \
  -P bundle-backend-and-frontend \
  -P jib-build-docker-image-and-push-it-to-docker-hub \
  -Dapp.image.tag=vX
```

### Important URLs:
- AWS Console: https://console.aws.amazon.com/elasticbeanstalk
- Docker Hub: https://hub.docker.com/r/joseeneassilva/springboot-react-fullstack
- Your App: `http://fullstack-syscomz-env.eba-xxxxxxxx.us-east-1.elasticbeanstalk.com`

---

## ✅ Success Criteria

**Your deployment is successful when ALL are true:**

- ✅ Environment Health: **Green/Ok**
- ✅ `/actuator/health` returns `{"status":"UP"}`
- ✅ `/api/v1/students` returns JSON
- ✅ Frontend loads in browser
- ✅ Can add a student via UI
- ✅ Student persists after page refresh

---

## 🎯 Summary Checklist

Before deploying:
- [ ] Docker image built and on Docker Hub
- [ ] `elasticbeanstalk/docker-compose.yaml` ready

During deployment:
- [ ] EB application created
- [ ] Database configured (username/password saved!)
- [ ] Environment shows Green/Ok

After deployment:
- [ ] Application URL accessible
- [ ] Health endpoint working
- [ ] API endpoints working
- [ ] Frontend loads and functions

---

**Good luck! 🚀**

**The termination event "Deleted log fragments" means it's in the final cleanup phase - should be done very soon!**
